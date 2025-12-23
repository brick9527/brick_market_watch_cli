const axios = require('axios');
const crypto = require('crypto'); // Node.js 内置加密模块，无需安装

const config = require('../../config.json');
const logger = require('./log4js').getLogger('dingtalk');

class DingTalkRobot {
  /**
   * 初始化机器人
   * @param {string} webhook - 机器人 WebHook 地址
   * @param {string} [secret] - 加签密钥（勾选「加签」时必填）
   */
  constructor(webhook, secret) {
    this.webhook = webhook;
    this.secret = secret; // 可选：无加签则传 undefined
  }

  /**
   * 计算签名（加签场景必用）
   * 参考钉钉官方签名逻辑：https://open.dingtalk.com/document/group/custom-robot-access
   */
  _calculateSignature() {
    if (!this.secret) return ''; // 未加签则返回空

    const timestamp = Date.now().toString(); // 毫秒级时间戳
    // const nonce = Math.random().toString(36).substring(2, 10); // 8位随机字符串

    // 1. 拼接字符串：timestamp + "\n" + nonce + "\n" + secret（换行符不能少）
    // const stringToSign = `${timestamp}\n${nonce}\n${this.secret}`;
    const stringToSign = `${timestamp}\n${this.secret}`;

    // 2. HMAC-SHA256 加密 → Base64 编码 → URL 编码
    const hmac = crypto.createHmac('sha256', this.secret);
    const sign = encodeURIComponent(hmac.update(stringToSign).digest('base64'));

    // 返回拼接后的 URL 参数（timestamp + nonce + sign）
    return `&timestamp=${timestamp}&sign=${sign}`;
  }

  /**
   * 发送消息核心方法
   * @param {object} msg - 消息体（不同消息类型结构不同）
   * @returns {Promise<object>} 钉钉响应结果
   */
  async _send(msg) {
    try {
      // 拼接完整请求 URL（WebHook + 签名参数）
      const requestUrl = this.webhook + this._calculateSignature();

      // 发送 POST 请求（Content-Type 必须是 application/json）
      const response = await axios.post(requestUrl, msg, {
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
      });

      const result = response.data;
      if (result.errcode === 0) {
        logger.info('钉钉消息发送成功：', result.errmsg);
      } else {
        logger.error('钉钉消息发送失败：', result);
      }
      return result;
    } catch (error) {
      logger.error('钉钉消息请求异常：', error.message);
      logger.error(error);
      return { errcode: -1, errmsg: '请求失败', error: error.message };
    }
  }

  /**
   * 1. 发送文本消息
   * @param {string} content - 消息内容
   * @param {string[]} [atMobiles=[]] - 需要@的手机号列表（如 ['138xxxx1234']）
   * @param {boolean} [isAtAll=false] - 是否@所有人
   */
  async sendText(content, atMobiles = [], isAtAll = false) {
    const msg = {
      msgtype: 'text',
      text: { content },
      at: { atMobiles, isAtAll },
    };
    return this._send(msg);
  }

  /**
   * 2. 发送 Markdown 消息（支持排版、链接、图片）
   * @param {string} title - 消息标题（钉钉列表页显示）
   * @param {string} text - Markdown 内容（支持钉钉语法：### 标题、> 引用、[链接]() 等）
   * @param {string[]} [atMobiles=[]] - 需要@的手机号列表
   * @param {boolean} [isAtAll=false] - 是否@所有人
   */
  async sendMarkdown(title, text, atMobiles = [], isAtAll = false) {
    const msg = {
      msgtype: 'markdown',
      markdown: { title, text },
      at: { atMobiles, isAtAll },
    };
    return this._send(msg);
  }
}

module.exports = module.exports = {
  prodDingTalkRobot: new DingTalkRobot(
    process.env.NODE_ENV === 'development' ? 
      (config.dingtalk?.monitor?.webhook || config.dingtalk.prod.webhook) : 
      config.dingtalk.prod.webhook,
    process.env.NODE_ENV === 'development' ?
      (config.dingtalk?.monitor?.secret || config.dingtalk.prod.secret) :
      config.dingtalk.prod.secret,
  ),
  monitorDingTalkRobot: new DingTalkRobot(
    config.dingtalk?.monitor?.webhook || config.dingtalk.prod.webhook,
    config.dingtalk?.monitor?.secret || config.dingtalk.prod.secret
  ),
};

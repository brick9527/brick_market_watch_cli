require('dotenv').config({ quiet: true });

const config = require('../../config.json');
const noticeConfig = require('../../notice.json');
const scheduleConfig = require('../../schedule.json');

const getLogger = require('../util/log4js').getLogger;
const logger = getLogger('init_process');
const { prodDingTalkRobot, monitorDingTalkRobot } = require('../util/dingtalk');
const getProxyConfig = require('./get_proxy');
const getSpotClient = require('../util/binance_spot_client');
const connectMongoDB = require('../util/mongoose');

const IGNORE_ERR = require('../../ignore_err.json');
const IGNORE_ERR_CODE = require('../../ignore_err_code.json');

class BrickProcess {
  // 进程变量引用
  _process = null;

  // 进程中的关键变量
  _brickMarketWatchCli = {
    name: null,
    // 上下文
    ctx: {},
    // 变量
    variables: {},
    // 连接器
    connector: {},
  };

  constructor(process, processName = 'default') {
    logger.debug('开始初始化进程数据...');

    if (process.brickMarketWatchCli) {
      logger.warn(`已经初始化process：${process.brickMarketWatchCli.name}, 跳过本次初始化`);
      return process;
    }

    logger.info(`初始化进程模式：${process.env.NODE_ENV}`);
    
    const proxyConfig = getProxyConfig();
    this._brickMarketWatchCli = {
      name: processName,
      
      ctx: {
        config,
        noticeConfig,
        scheduleConfig,
        proxyConfig,
        logger: getLogger(processName),
        dingtalk: {
          prodDingTalkRobot,
          monitorDingTalkRobot,
        },
        spotClient: null,
        mongoClient: null,
      },

      // 变量
      variables: {
        // 禁用告警的交易对集合
        disableNoticeSymbolSet: {},
      },
      // 连接器
      connector: {
        connectMongoDB,
      },
    };

    this._process = process;

    this._process.brickMarketWatchCli = this._brickMarketWatchCli;

    this._bindEventListeners(process);

    this._createSpotClient();

    logger.info('初始化进程数据完成');

    return this;
  }

  _bindEventListeners(process) {
    // 1. 捕获同步/回调异步中的未捕获错误
    process.on('uncaughtException', (error) => {
      let msg = '未捕获的同步/回调异步错误：\n';
      msg += `错误信息：${error.message}\n`;
      msg += `错误堆栈：${error.stack}\n`;
      msg += `错误码：${error.code}\n`; // 错误标识（如 ETIMEDOUT、ECONNREFUSED）
      
      process.brickMarketWatchCli.ctx.logger.error(msg);

      if (!IGNORE_ERR_CODE.includes(error.code)) {
        monitorDingTalkRobot.sendText(`${process.brickMarketWatchCli.name}\n ${msg}`);
      }
    });

    // 2. 捕获 Promise 未处理的拒绝（最容易遗漏的场景）
    process.on('unhandledRejection', (reason, promise) => {
      let msg = '未处理的 Promise 拒绝：\n';

      const errReason = reason instanceof Error ? reason.message : reason;
      msg += `拒绝原因：${errReason}\n`;
      msg += `关联的 Promise：${promise}\n`;
      msg += `错误堆栈：${reason instanceof Error ? reason.stack : '无'}\n`;

      process.brickMarketWatchCli.ctx.logger.error(msg);

      // // 处理建议：同样做清理工作，避免内存泄漏或资源占用
      // cleanUpResources().then(() => {
      //   process.exit(1);
      // });

      // 发送钉钉通知
      if (!IGNORE_ERR.includes(errReason)) {
        monitorDingTalkRobot.sendText(`${process.brickMarketWatchCli.name}\n ${msg}`);
      }

    });
  }

  _updateProcess() {
    this._process.brickMarketWatchCli = this._brickMarketWatchCli;
  }

  _createSpotClient() {
    this._brickMarketWatchCli.ctx.spotClient = getSpotClient(this._brickMarketWatchCli.ctx.proxyConfig);
    this._updateProcess();
  }
  
  async createMongoClient() {
    this._brickMarketWatchCli.ctx.mongoClient = await connectMongoDB(this._brickMarketWatchCli.ctx.config.database);
    this._updateProcess();
  }

  get brickMarketWatchCli() {
    return this._brickMarketWatchCli;
  }
}

module.exports = BrickProcess;

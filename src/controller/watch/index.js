const dayjs = require('dayjs');
const _ = require('lodash');

const { checkSymbolNotice } = require('../../libs/check_notice');

function _filterActiveDisableNoticeSymbolSet(disableNoticeSymbolSet, currentTime) {
  return _.pickBy(disableNoticeSymbolSet, (noticeInfo) => {
    return noticeInfo?.expireTime && dayjs(noticeInfo.expireTime).isAfter(dayjs(currentTime));
  });
}

/**
 * 获取加密货币交易对的最新价格并检查告警条件
 * 
 * @async
 * @function getTrickerPrice
 * @param {Object} options - 函数参数配置
 * @param {Array<string>} [options.symbolList=[]] - 需要查询的交易对列表，如 ['BTCUSDT', 'ETHUSDT']
 * @param {boolean} [options.enableCheckNotice=false] - 是否启用价格告警检查
 * @param {boolean} [options.sendDingtalkMsg=false] - 是否将告警信息发送到钉钉
 * @returns {Promise<void>} - 无返回值，直接处理价格数据和告警
 * 
 * @description
 * 该函数主要完成以下功能：
 * 1. 调用 Binance Spot API 获取指定交易对的最新市场价格
 * 2. 将价格数据记录到日志系统
 * 3. 根据配置检查每个交易对是否触发价格告警条件
 * 4. 管理告警抑制机制，避免短时间内重复发送相同告警
 * 5. 将满足条件的告警信息格式化为友好文本并发送到钉钉
 */
async function getTrickerPrice({
  symbolList = [],
  enableCheckNotice = false,
  sendDingtalkMsg = false
}) {
  const { ctx, variables } = process.brickMarketWatchCli;
  const { logger, noticeConfig, spotClient, dingtalk } = ctx;

  // 记录当前时间，用于日志和告警消息的时间戳
  const closeLocalTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
  
  // 调用 Binance Spot API 获取指定交易对的最新价格
  const result = await spotClient.restAPI.tickerPrice({ symbols: symbolList });

  logger.info('=============tickerPrice=============');

  // 解析 API 响应数据
  const data = await result.data();
  /**
   * data 数据结构示例：
   * [
   *   { symbol: 'BTCUSDT', price: '87066.01000000' },
   *   { symbol: 'ETHUSDT', price: '4305.25000000' }
   * ]
   */
  
  // 将价格数据和当前时间记录到日志
  logger.info({
    data,
    closeLocalTime,
  });

  // 告警处理相关变量初始化
  const noticeGroup = {};  // 存储每个交易对的告警消息
  let disableNoticeSymbolSet = {};  // 存储需要抑制告警的交易对及过期时间
  const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
  
  // 如果没有启用了告警检查
  if (!enableCheckNotice) {
    return {
      data,
      closeLocalTime,
    };
  }

  // #region 如果启用了告警检查
  // 遍历每个交易对的价格数据
  for (const dataItem of data) {
    // 检查该交易对是否满足告警条件
    // checkResult 返回结构：{ noticeMsg, readyToNoticeSymbolList }
    const checkResult = checkSymbolNotice(dataItem.symbol, dataItem.price);
    
    // 存储该交易对的告警消息
    noticeGroup[dataItem.symbol] = checkResult.noticeMsg || null;
    
    // 获取需要发送告警的交易对列表
    const readyToNoticeSymbolList = checkResult.readyToNoticeSymbolList || [];

    logger.debug(`noticeConfig.expire = ${noticeConfig.expire}`);
    logger.debug(`currentTime = ${currentTime}`);
    logger.debug(`expireTime = ${dayjs(currentTime).add(noticeConfig.expire, 'm').format('YYYY-MM-DD HH:mm:ss')}`)
    // 为需要告警的交易对设置告警抑制时间
    for (const readyToNoticeSymbolItem of readyToNoticeSymbolList) {
      disableNoticeSymbolSet[readyToNoticeSymbolItem] = {
        // 相同交易对告警抑制开始时间
        startTime: currentTime,
        // 相同交易对告警抑制过期时间
        expireTime: dayjs(currentTime).add(noticeConfig.expire, 'm').format('YYYY-MM-DD HH:mm:ss'),
      };
    }
  }
  // #endregion 如果启用了告警检查

  // 将告警消息组记录到调试日志
  logger.debug(`noticeGroup: ${JSON.stringify(noticeGroup)}`);

  // 如果没有启用了钉钉通知
  if (!sendDingtalkMsg) {
    return {
      data,
      closeLocalTime,
    }; 
  }

  // #region 如果启用了钉钉通知
  let hasNoticeMsg = false;  // 标记是否存在需要发送的告警消息
    
  // 构建钉钉通知内容
  let msgContent = `<${closeLocalTime}>\n`;
  const noticeSymbolList = Object.keys(noticeGroup);
  
  // 遍历所有交易对的告警信息
  for (const symbolItem of noticeSymbolList) {
    // 跳过没有告警消息的交易对
    if (!noticeGroup[symbolItem]) {
      continue;
    }
    // 检查是否包含实际的告警消息（warning或info类型）
    if (_.get(noticeGroup, `${symbolItem}.warningMsg.length`, 0) === 0 && _.get(noticeGroup, `${symbolItem}.infoMsg.length`, 0) === 0) {
      continue;
    }
    hasNoticeMsg = true;
    msgContent += `# ${symbolItem}\n`;  // 添加交易对名称标题
    // 添加不同类型的告警消息（warningMsg、infoMsg等）
    for (const msgType of Object.keys(noticeGroup[symbolItem])) {
      msgContent += noticeGroup[symbolItem][msgType].join('\n');
    }
    msgContent += '\n--------------------------\n';  // 交易对之间的分隔线
  }
  // 将完整的通知内容记录到调试日志
  logger.debug(msgContent);
  // 如果存在告警消息，则发送到钉钉
  if (hasNoticeMsg) {
    await dingtalk.prodDingTalkRobot.sendText(msgContent);
    
    // 更新全局的告警抑制列表，避免短时间内重复发送相同告警
    const newDisableNoticeSymbolSet = {
      ...variables.disableNoticeSymbolSet,  // 保留原有的抑制规则
      ...disableNoticeSymbolSet,  // 添加新的抑制规则
    };

    variables.disableNoticeSymbolSet = _filterActiveDisableNoticeSymbolSet(newDisableNoticeSymbolSet, currentTime);

    logger.debug(`variables.disableNoticeSymbolSet: ${JSON.stringify(disableNoticeSymbolSet)}`);
  }

  // #endregion 如果启用了钉钉通知
}

module.exports = {
  getTrickerPrice,  // 导出函数，供其他模块使用
};
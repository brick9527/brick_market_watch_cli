const dayjs = require('dayjs');

const { checkSymbolNotice } = require('../../libs/check_notice');
const generateNoticeMsg = require('./generate_notice_msg');
const changeNoticeConfigEnable = require('./change_notice_enable');

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
  const { ctx } = process.brickMarketWatchCli;
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
  const noticeTargetList = [];
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
    // checkResult 返回结构：{ noticeMsg, noticeTargetList }
    const checkResult = checkSymbolNotice(dataItem.symbol, dataItem.price);

    noticeTargetList.push(...checkResult.noticeTargetList.warningList);
    noticeTargetList.push(...checkResult.noticeTargetList.infoList);
    
    // 存储该交易对的告警消息
    /**
     * checkResult.noticeMsg = {
     *   warningMsg: [],  // 存储警告级别的告警消息
     *   infoMsg: [],     // 存储信息级别的告警消息
     * }
     */
    noticeGroup[dataItem.symbol] = checkResult.noticeMsg || null;
    
    logger.debug(`noticeConfig.expire = ${noticeConfig.expire}`);
    logger.debug(`currentTime = ${currentTime}`);    
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
  const { hasNoticeMsg, msgContent } = generateNoticeMsg({ noticeGroup, closeLocalTime });
    
  // 将完整的通知内容记录到调试日志
  logger.debug(msgContent);
  if (!hasNoticeMsg) {
    logger.warn('没有需要发送的告警消息');
    return {
      data,
      closeLocalTime,
    };
  }

  await dingtalk.prodDingTalkRobot.sendText(msgContent);
  
  // TODO: 根据配置中的triggerToClose关闭对应告警
  // 遍历 noticeTargetList 中的每个目标
  // 检查是否需要关闭告警
  // 如果需要关闭，调用 closeNotice 函数
  const allTriggerToClose = [];
  const allTriggerToOpen = [];
  for (const noticeTargetItem of noticeTargetList) {
    allTriggerToClose.push(...noticeTargetItem.triggerToClose);
    allTriggerToOpen.push(...noticeTargetItem.triggerToOpen);
  }
  changeNoticeConfigEnable(allTriggerToClose, allTriggerToOpen);

  // #endregion 如果启用了钉钉通知
}

module.exports = {
  getTrickerPrice,  // 导出函数，供其他模块使用
};
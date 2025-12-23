const dayjs = require('dayjs');
const _ = require('lodash');

function _checkNoticeExpire({ noticeSymbolName }) {
  const { logger } = process.brickMarketWatchCli.ctx;
  const { variables } = process.brickMarketWatchCli;

  // 获取该告警标识的抑制信息
  const noticeSymbolInfo = variables?.disableNoticeSymbolSet[noticeSymbolName];
  logger.debug(`noticeSymbolName = ${noticeSymbolName}\n noticeSymbolInfo = ${JSON.stringify(noticeSymbolInfo)}`);
  
  // 检查是否处于告警抑制期
  if (noticeSymbolInfo && dayjs(noticeSymbolInfo.expireTime).isAfter(dayjs())) {
    // 该告警处于抑制期，跳过
    logger.warn(`${noticeSymbolName} 在封禁期. startTime = ${noticeSymbolInfo.startTime}, expireTime = ${noticeSymbolInfo.expireTime}`)
    return {
      isExpire: false,
    };
  }
  
  return {
    isExpire: true,
  };
}

/**
 * 检查加密货币交易对是否触发警告级别告警条件
 * 
 * @private
 * @function _checkWarningTarget
 * @param {Object} params - 函数参数对象
 * @param {string} params.symbol - 加密货币交易对符号，如 'BTCUSDT'
 * @param {string|number} params.price - 交易对当前价格
 * @returns {Object} 警告级别检查结果
 * @returns {boolean} return.status - 检查是否成功执行（有配置且无严重错误）
 * @returns {Array<string>} return.warningMsg - 生成的警告级告警消息列表
 * @returns {Array<string>} return.readyToNoticeSymbolList - 待发送告警的交易对标识列表
 * 
 * @description
 * 该函数负责：
 * 1. 获取指定交易对配置的所有警告级别告警目标
 * 2. 遍历检查每个启用的警告目标，判断当前价格是否低于等于警告阈值
 * 3. 对触发条件的告警目标，检查是否处于告警抑制期
 * 4. 收集所有需要发送的警告级告警消息和对应的告警标识
 */
function _checkWarningTarget({ symbol, price }) {
  // 从全局上下文获取日志工具和告警配置
  const { logger } = process.brickMarketWatchCli.ctx;
  const { noticeConfig } = process.brickMarketWatchCli.ctx;
  
  // 初始化警告消息数组和待通知列表
  const warningMsg = [];
  const readyToNoticeSymbolList = [];

  // 获取该交易对的所有警告级别告警目标配置
  const symbolPriceWarningTargetList = _.get(noticeConfig, `warning_target.${symbol}`, []);
  
  // 如果该交易对没有配置警告级别的告警目标，返回检查结果
  if (symbolPriceWarningTargetList.length === 0) {
    return { status: false };
  }

  // 遍历处理每个警告级别告警目标
  for (const warningTargetItem of symbolPriceWarningTargetList) {
    // 如果告警目标未启用，跳过该目标
    if (!warningTargetItem.enable) {
      continue;
    }

    // 将价格转换为数字类型以便比较
    const warningTargetPriceNum = Number(warningTargetItem.price);
    const priceNum = Number(price);
    
    // 验证价格数据有效性，无效则记录警告并继续处理下一个目标
    if (Number.isNaN(warningTargetPriceNum) || Number.isNaN(priceNum)) {
      logger.warn(`warningTargetPriceNum or priceNum is NaN, warningTargetItem = ${JSON.stringify(warningTargetItem)}, price = ${price}`);
      continue;
    }

    // 检查是否触发警告级告警条件（当前价格低于等于警告阈值）
    if (warningTargetPriceNum < priceNum) {
      continue;
    }
    
    // 构建警告级告警消息内容
    const warningMsgContent = `【warning】${symbol} 突破 ${warningTargetItem.price} ↓ 点位, 当前价格：${price}`;
    logger.info(warningMsgContent);

    // 生成告警标识（用于告警抑制检查和管理）
    const noticeSymbolName = `warning_${symbol}_${warningTargetItem.price}`;
    
    // 检查告警是否处于抑制期
    const { isExpire } = _checkNoticeExpire({ noticeSymbolName });

    // 如果告警处于抑制期，跳过发送
    if (!isExpire) {
      continue;
    }

    // 将告警消息和标识添加到对应列表中
    warningMsg.push(warningMsgContent);
    readyToNoticeSymbolList.push(noticeSymbolName);
  }

  // 返回警告级别检查结果
  return {
    status: true,
    warningMsg,
    readyToNoticeSymbolList,
  };
}

/**
 * 检查加密货币交易对是否触发信息级别告警条件
 * 
 * @private
 * @function _checkInfoTarget
 * @param {Object} params - 函数参数对象
 * @param {string} params.symbol - 加密货币交易对符号，如 'BTCUSDT'
 * @param {string|number} params.price - 交易对当前价格
 * @returns {Object} 信息级别检查结果
 * @returns {boolean} return.status - 检查是否成功执行（有配置且无严重错误）
 * @returns {Array<string>} return.infoMsg - 生成的信息级告警消息列表
 * @returns {Array<string>} return.readyToNoticeSymbolList - 待发送告警的交易对标识列表
 * 
 * @description
 * 该函数负责：
 * 1. 获取指定交易对配置的所有信息级别告警目标
 * 2. 遍历检查每个启用的信息目标，判断当前价格是否高于等于信息阈值
 * 3. 对触发条件的告警目标，检查是否处于告警抑制期
 * 4. 收集所有需要发送的信息级告警消息和对应的告警标识
 */
function _checkInfoTarget({ symbol, price }) {
  // 从全局上下文获取日志工具和告警配置
  const { logger } = process.brickMarketWatchCli.ctx;
  const { noticeConfig } = process.brickMarketWatchCli.ctx;
  
  // 初始化信息消息数组和待通知列表
  const infoMsg = [];
  const readyToNoticeSymbolList = [];

  // 获取该交易对的所有信息级别告警目标配置
  const symbolPriceInfoTargetList = _.get(noticeConfig, `info_target.${symbol}`, []);

  // 如果该交易对没有配置信息级别的告警目标，返回检查结果
  if (symbolPriceInfoTargetList.length === 0) {
    return { status: false };
  }

  // 遍历处理每个信息级别告警目标
  for (const infoTargetItem of symbolPriceInfoTargetList) {
    // 如果告警目标未启用，跳过该目标
    if (!infoTargetItem.enable) {
      continue;
    }

    // 将价格转换为数字类型以便比较
    const infoTargetPriceNum = Number(infoTargetItem.price);
    const priceNum = Number(price);
    
    // 验证价格数据有效性，无效则抛出错误
    if (Number.isNaN(infoTargetPriceNum) || Number.isNaN(priceNum)) {
      throw new Error(`infoTargetPriceNum or priceNum is NaN`);
    }

    // 检查是否触发信息级告警条件（当前价格高于等于信息阈值）
    if (infoTargetPriceNum > priceNum) {
      continue;
    }

    // 构建信息级告警消息内容
    const infoMsgContent = `【info】${symbol} 突破 ${infoTargetItem.price} ↑ 点位, 当前价格：${price}`;
    logger.info(infoMsgContent);

    // 生成告警标识（用于告警抑制检查和管理）
    const noticeSymbolName = `info_${symbol}_${infoTargetItem.price}`;
    
    // 检查告警是否处于抑制期
    const { isExpire } = _checkNoticeExpire({ noticeSymbolName });

    // 如果告警处于抑制期，跳过发送
    if (!isExpire) {
      continue;
    }

    // 将告警消息和标识添加到对应列表中
    infoMsg.push(infoMsgContent);
    readyToNoticeSymbolList.push(noticeSymbolName);
  }

  // 返回信息级别检查结果
  return {
    status: true,
    infoMsg,
    readyToNoticeSymbolList,
  };
}

/**
 * 检查加密货币交易对价格是否触发告警条件
 * 
 * @function checkSymbolNotice
 * @param {string} symbol - 交易对符号，如 'BTCUSDT'
 * @param {string|number} price - 当前交易对价格
 * @returns {Object|null} 包含告警消息和待通知交易对列表的对象，或null（如果未配置告警目标）
 * @returns {Object} return.noticeMsg - 告警消息对象
 * @returns {Array<string>} return.noticeMsg.warningMsg - 警告级别的告警消息列表
 * @returns {Array<string>} return.noticeMsg.infoMsg - 信息级别的告警消息列表
 * @returns {Array<string>} return.readyToNoticeSymbolList - 待发送告警的交易对标识列表
 * 
 * @description
 * 该函数主要完成以下功能：
 * 1. 检查指定交易对是否配置了告警目标（warning_target 和 info_target）
 * 2. 对每个启用的告警目标，判断当前价格是否触发告警条件
 * 3. 实现告警抑制机制，避免短时间内重复发送相同告警
 * 4. 收集所有满足条件的告警消息和待通知的交易对标识
 */
function checkSymbolNotice(symbol, price) {
  // 初始化告警消息对象
  const noticeMsg = {
    warningMsg: [],  // 存储警告级别的告警消息
    infoMsg: [],     // 存储信息级别的告警消息
  };

  // 存储待发送告警的交易对标识列表
  // 格式：warning_<symbol>_<price> 或 info_<symbol>_<price>
  const readyToNoticeSymbolList = [];
  const { status: warningCheckStatus, warningMsg, readyToNoticeSymbolList: warningReadyToNoticeSymbolList } = _checkWarningTarget({ symbol, price });
  if (warningCheckStatus) {
    noticeMsg.warningMsg.push(...warningMsg);
    readyToNoticeSymbolList.push(...warningReadyToNoticeSymbolList);
  }

  const { status: infoCheckStatus, infoMsg, readyToNoticeSymbolList: infoReadyToNoticeSymbolList } = _checkInfoTarget({ symbol, price });
  if (infoCheckStatus) {
    noticeMsg.infoMsg.push(...infoMsg);
    readyToNoticeSymbolList.push(...infoReadyToNoticeSymbolList);
  }

  // 返回告警消息和待通知交易对列表
  return {
    noticeMsg,
    readyToNoticeSymbolList,
  };
}

module.exports = {
  checkSymbolNotice,
};
const dayjs = require('dayjs');
const _ = require('lodash');

function checkSymbolNotice(symbol, price) {
  const { logger, noticeConfig } = process.brickMarketWatchCli.ctx;
  const variables = process.brickMarketWatchCli.variables;

  const noticeMsg = {
    warningMsg: [],
    infoMsg: [],
  };

  // 把所有要通知的币对存入 readyToNoticeSymbolList中
  // 完成通知后 readyToNoticeSymbolList -> hasNoticeSymbolList
  const readyToNoticeSymbolList = [];
  
  // #region 检查warning_target
  const symbolPriceWarningTargetList = _.get(noticeConfig, `warning_target.${symbol}`, []);

  if (symbolPriceWarningTargetList.length === 0) {
    return;
  }

  let isWarningExist = false;
  for (const warningTargetItem of symbolPriceWarningTargetList) {
    if (!warningTargetItem.enable) {
      continue;
    }

    const warningTargetPriceNum = Number(warningTargetItem.price);
    const priceNum = Number(price);
    if (Number.isNaN(warningTargetPriceNum) || Number.isNaN(priceNum)) {
      throw new Error(`warningTargetPriceNum or priceNum is NaN`);
    }

    const noticeSymbolName = `warning_${symbol}_${warningTargetItem.price}`;
    const noticeSymbolInfo = variables.disableNoticeSymbolSet[noticeSymbolName];
    if (noticeSymbolInfo
      && Object.keys(variables.disableNoticeSymbolSet).includes(noticeSymbolName)
      && dayjs(noticeSymbolInfo.expireTime).isBefore(dayjs())
    ) {
      // 已经存在被封禁的了, 检查封禁时间
      logger.warn(`${noticeSymbolName} 在封禁期. startTime = ${noticeSymbolInfo.startTime}, expireTime = ${noticeSymbolInfo.expireTime}`)
      continue;
    }

    if (warningTargetPriceNum >= priceNum) {
      // 触发warning
      if (!isWarningExist) {
        isWarningExist = true;
      }

      const warningMsgContent =  `【warning】${symbol} 突破 ${warningTargetItem.price} ↓ 点位, 当前价格：${price}`;
      logger.info(warningMsgContent);

      noticeMsg.warningMsg.push(warningMsgContent);
      readyToNoticeSymbolList.push(noticeSymbolName);
    }
  }
  // #endregion 检查warning_target

  // #region 检查info_target
  const symbolPriceInfoTargetList = _.get(noticeConfig, `info_target.${symbol}`, []);

  let isInfoExist = false;
  for (const infoTargetItem of symbolPriceInfoTargetList) {
    if (!infoTargetItem.enable) {
      continue;
    }

    const infoTargetPriceNum = Number(infoTargetItem.price);
    const priceNum = Number(price);
    if (Number.isNaN(infoTargetPriceNum) || Number.isNaN(priceNum)) {
      throw new Error(`infoTargetPriceNum or priceNum is NaN`);
    }

    const noticeSymbolName = `info_${symbol}_${infoTargetItem.price}`;
    const noticeSymbolInfo = variables.disableNoticeSymbolSet[noticeSymbolName];
    if (noticeSymbolInfo
      && Object.keys(variables.disableNoticeSymbolSet).includes(noticeSymbolName)
      && dayjs(noticeSymbolInfo.expireTime).isBefore(dayjs())
    ) {
      // 已经存在被封禁的了, 检查封禁时间
      logger.warn(`${noticeSymbolName} 在封禁期. startTime = ${noticeSymbolInfo.startTime}, expireTime = ${noticeSymbolInfo.expireTime}`)
      continue;
    }

    if (infoTargetPriceNum <= priceNum) {
      // 触发info
      if (!isInfoExist) {
        isInfoExist = true;
      }

      const infoMsgContent = `【info】${symbol} 突破 ${infoTargetItem.price} ↑ 点位, 当前价格：${price}`;
      logger.info(infoMsgContent);

      noticeMsg.infoMsg.push(infoMsgContent);
      readyToNoticeSymbolList.push(noticeSymbolName);
    }
  }
  // #endregion 检查info_target

  return {
    noticeMsg,
    readyToNoticeSymbolList,
  };
}

module.exports = {
  checkSymbolNotice,
};

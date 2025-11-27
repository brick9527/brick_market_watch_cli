const dayjs = require("dayjs");
const _ = require("lodash");

const { logger } = process.brickMarketWatchCli.ctx;
const variables = process.brickMarketWatchCli.variables;

function checkSymbolNotice(symbol, price) {
  const noticeMsg = {
    warningMsg: [],
    infoMsg: [],
  };

  // 把所有要通知的币对存入 readyToNoticeSymbolList中
  // 完成通知后 readyToNoticeSymbolList -> hasNoticeSymbolList
  const readyToNoticeSymbolList = [];
  
  const config = process.brickMarketWatchCli.ctx.config;

  const symbolPriceWarningTargetList = _.get(
    config,
    `warning_target.${symbol}`,
    []
  );

  if (symbolPriceWarningTargetList.length === 0) {
    return;
  }

  const enableWarningTargetList = symbolPriceWarningTargetList.filter(
    (item) => item.enable
  );

  let isWarningExist = false;
  for (const warningTargetItem of enableWarningTargetList) {
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
        logger.info("=============warning=============");
        isWarningExist = true;
      }

      const warningMsgContent =  `【warning】${symbol} 突破 ${warningTargetItem.price} ↓ 点位, 当前价格：${price}`;
      logger.info(warningMsgContent);

      noticeMsg.warningMsg.push(warningMsgContent);
      readyToNoticeSymbolList.push();
    }
  }

  const symbolPriceInfoTargetList = _.get(config, `info_target.${symbol}`, []);

  const enableInfoTargetList = symbolPriceInfoTargetList.filter(
    (item) => item.enable
  );

  let isInfoExist = false;
  for (const infoTargetItem of enableInfoTargetList) {
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
        logger.info("=============info=============");
        isInfoExist = true;
      }

      const infoMsgContent = `【info】${symbol} 突破 ${infoTargetItem.price} ↑ 点位, 当前价格：${price}`;
      logger.info(infoMsgContent);

      noticeMsg.infoMsg.push(infoMsgContent);
      readyToNoticeSymbolList.push(`info_${symbol}_${infoTargetItem.price}`);
    }
  }

  return {
    noticeMsg,
    readyToNoticeSymbolList,
  };
}

module.exports = {
  checkSymbolNotice,
};

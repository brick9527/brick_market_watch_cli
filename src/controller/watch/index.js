const dayjs = require("dayjs");
const _ = require('lodash');

const { checkSymbolNotice } = require("../../libs/check_notice");
const { prodDingTalkRobot } = require("../../util/dingtalk");
const logger = require('../../util/log4js').getLogger('watch');

async function _allSettledResultFormatter(resultList, symbolList) {
  const result = [];
  for (let i = 0; i < resultList.length; i++) {
    const resultItem = resultList[i];

    if (resultItem.status === "fulfilled") {
      const data = await resultItem.value.data();
      data.status = resultItem.status;
      data.name = symbolList[i];
      data.closeLocalTime = dayjs(data.closeTime).format("YYYY-MM-DD HH:mm:ss");
      result.push(data);
      continue;
    }

    result.push({
      name: symbolList[i],
      status: resultItem.status,
    });
  }

  return result;
}

async function getSymbolAvgPrice(spotClient, symbolList = [], enableCheckNotice = false) {
  const requestInstanceList = symbolList.map((symbolItem) => {
    return spotClient.restAPI.avgPrice({ symbol: symbolItem });
  });

  let resultList = [];
  try {
    resultList = await Promise.allSettled(requestInstanceList);
  } catch (err) {
    logger.error(err);
  }

  const result = await _allSettledResultFormatter(resultList, symbolList);

  logger.info("=============avgPrice=============");
  logger.info(result);

  // 检查告警
  if (enableCheckNotice) {
    for (const resultItem of result) {
      if (resultItem.status !== "fulfilled") {
        continue;
      }

      checkSymbolNotice(resultItem.name, resultItem.price);
    }
  }
  return result;
}

async function getTrickerPrice(
  spotClient,
  symbolList = [],
  enableCheckNotice = false,
  sendDingtalkMsg = false
) {
  const closeLocalTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const result = await spotClient.restAPI.tickerPrice({ symbols: symbolList });

  logger.info("=============tickerPrice=============");

  const data = await result.data();
  logger.info({
    data,
    closeLocalTime,
  });

  // 检查告警
  const noticeGroup = {};
  if (enableCheckNotice) {
    for (const dataItem of data) {
      const noticeMsg = checkSymbolNotice(dataItem.symbol, dataItem.price);
      noticeGroup[dataItem.symbol] = noticeMsg || null;
    }
  }

  logger.info('[debug] ', JSON.stringify(noticeGroup));

  if (sendDingtalkMsg) {
    let hasNoticeMsg = false;
    // 整理 noticeGroup 的文本信息
    let msgContent = `<${closeLocalTime}>\n`;
    const symbolList = Object.keys(noticeGroup);
    for (const symbolItem of symbolList) {
      if (!noticeGroup[symbolItem]) {
        continue;
      }

      if (_.get(noticeGroup, `${symbolItem}.warningMsg.length`, 0) === 0 && _.get(noticeGroup, `${symbolItem}.infoMsg.length`, 0) === 0) {
        continue;
      }

      hasNoticeMsg = true;
      msgContent += `# ${symbolItem}\n`;

      for (const msgType of Object.keys(noticeGroup[symbolItem])) {
        msgContent += noticeGroup[symbolItem][msgType].join('\n');
      }

      msgContent += '\n--------------------------\n';
    }

    logger.info('[debug] ', msgContent);

    if (hasNoticeMsg) {
      await prodDingTalkRobot.sendText(msgContent);
    }
  }
}

module.exports = {
  getSymbolAvgPrice,
  getTrickerPrice,
};

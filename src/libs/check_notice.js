const _ = require("lodash");
const path = require("path");

const { readFile, writeFile } = require("../util/file");

function checkSymbolNotice(symbol, price) {
  const configRawContent = readFile(
    "notice.json",
    path.join(__dirname, "../../")
  );
  const config = JSON.parse(configRawContent);

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

    if (warningTargetPriceNum >= priceNum) {
      // 触发warning
      if (!isWarningExist) {
        console.log("=============warning============");
        isWarningExist = true;
      }
      console.log(
        `【warning】${symbol} 突破 ${warningTargetItem.price} 点位, 当前价格：${price}`
      );
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

    if (infoTargetPriceNum <= priceNum) {
      // 触发info
      if (!isInfoExist) {
        console.log("=============info============");
        isInfoExist = true;
      }

      console.log(
        `【info】${symbol} 突破 ${infoTargetItem.price} 点位, 当前价格：${price}`
      );
    }
  }
}

module.exports = {
  checkSymbolNotice,
};

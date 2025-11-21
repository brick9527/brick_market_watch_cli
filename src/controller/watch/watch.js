const dayjs = require("dayjs");

const spotClient = require("../../util/binance_spot_client");
const { checkSymbolNotice } = require("../../libs/check_notice");

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

async function getSymbolAvgPrice(symbolList = [], enableCheckNotice = false) {
  const requestInstanceList = symbolList.map((symbolItem) => {
    return spotClient.restAPI.avgPrice({ symbol: symbolItem });
  });

  let resultList = [];
  try {
    resultList = await Promise.allSettled(requestInstanceList);
  } catch (err) {
    console.log(err);
  }

  const result = await _allSettledResultFormatter(resultList, symbolList);

  console.log("=============avgPrice============");
  console.log(result);

  // 检查告警
  if (enableCheckNotice) {
    for (const resultItem of result) {
      if (resultItem.status !== 'fulfilled') {
        continue;
      }

      checkSymbolNotice(resultItem.name, resultItem.price);
    }
  }
  return result;
}

async function getTrickerPrice(symbolList = [], enableCheckNotice = false) {
  const closeLocalTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  const result = await spotClient.restAPI.tickerPrice({ symbols: symbolList });

  console.log("=============tickerPrice============");

  const data = await result.data();
  console.log({
    data,
    closeLocalTime,
  });

  // 检查告警
  if (enableCheckNotice) {
    for (const dataItem of data) {
      checkSymbolNotice(dataItem.symbol, dataItem.price);
    }
  }
}

module.exports = {
  getSymbolAvgPrice,
  getTrickerPrice,
};

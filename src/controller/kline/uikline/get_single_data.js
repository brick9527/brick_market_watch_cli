const dayjs = require('dayjs');

async function getKlineData({ symbol, interval, startTime, endTime }) {
  const { ctx } = process.brickMarketWatchCli;
  const { logger, spotClient } = ctx;

  const condition = {
    symbol,
    interval,
    startTime: dayjs(startTime).valueOf(),
    endTime: endTime || Date.now(),
    timeZone: 8,
    limit: 1000,
  };

  logger.debug(`condition = ${JSON.stringify(condition)}`);

  // 调用 Binance Spot API 获取指定交易对的 K 线数据
  const result = await spotClient.restAPI.uiKlines(condition);

  logger.debug('=============klines=============');

  // 解析 API 响应数据
  const data = await result.data();
  /**
   * data 数据结构示例：
   * [
        [
          1499040000000,      // k线开盘时间
          "0.01634790",       // 开盘价
          "0.80000000",       // 最高价
          "0.01575800",       // 最低价
          "0.01577100",       // 收盘价(当前K线未结束的即为最新价)
          "148976.11427815",  // 成交量
          1499644799999,      // k线收盘时间
          "2434.19055334",    // 成交额
          308,                // 成交笔数
          "1756.87402397",    // 主动买入成交量
          "28.46694368",      // 主动买入成交额
          "0"                 // 请忽略该参数
        ]
   * ]
   */
  
  // 将价格数据和当前时间记录到日志
  logger.debug(`symbol: ${symbol}, interval: ${interval}, data: ${JSON.stringify(data)}`);

  return data;
}

module.exports = getKlineData;
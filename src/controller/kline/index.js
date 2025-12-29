const dayjs = require('dayjs');
const path = require('path');
const { SpotRestAPI } = require('@binance/spot');


const getSingleUiklineData = require('./uikline/get_single_data');
const { writeJson2CsvFile } = require('../../libs/csv');

async function getKlineData({ symbolList, interval, startTime, endTime, outputFolder }) {

  // await getUiklineData({ symbol, interval, startTime, endTime });
  for (const symbol of symbolList) {
    const symbolKlineData = await getSingleUiklineData({
      symbol,
      interval: SpotRestAPI.UiKlinesIntervalEnum.INTERVAL_5m,
      startTime: dayjs(startTime).valueOf(),
      endTime: dayjs(endTime).valueOf(),
    });

    const filePath = path.join(outputFolder, `${symbol}-${interval}-${startTime}-${endTime}.csv`);
    await writeJson2CsvFile({
      jsonData: symbolKlineData,
      filePath,
      options: {
        fields: [
          { label: 'openTime', value: '0' },
          { label: 'open', value: '1' },
          { label: 'high', value: '2' },
          { label: 'low', value: '3' },
          { label: 'close', value: '4' },
          { label: 'volume', value: '5' },
          { label: 'closeTime', value: '6' },
          { label: 'quoteAssetVolume', value: '7' },
          { label: 'trades', value: '8' },
          { label: 'takerBuyBaseAssetVolume', value: '9' },
          { label: 'takerBuyQuoteAssetVolume', value: '10' },
          { label: 'ignore', value: '11' },
        ],
      },
    });
  }
}

module.exports = getKlineData;
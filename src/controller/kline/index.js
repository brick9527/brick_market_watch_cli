const dayjs = require('dayjs');
const path = require('path');

const getSingleUiklineData = require('./uikline/get_single_data');
const seperateTask = require('./task/index');
const { writeJson2CsvFile } = require('../../libs/csv');

async function getKlineData({ symbolList, interval, startTime, endTime, outputFolder }) {
  const { ctx } = process.brickMarketWatchCli;
  const { logger } = ctx;

  const taskList = await seperateTask({ symbolList, interval, startTime, endTime });
  await writeJson2CsvFile({
    jsonData: taskList,
    filePath: path.join(outputFolder, `tasklist-${startTime}-${endTime}.csv`),
  });

  for (let i = 0; i < taskList.length; i++) {
    logger.info(`开始获取第${i + 1} / ${taskList.length}个任务数据`);

    const taskItem = taskList[i];
    const { symbol, startTime, endTime, interval } = taskItem;
    const symbolKlineData = await getSingleUiklineData({
      symbol,
      interval,
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
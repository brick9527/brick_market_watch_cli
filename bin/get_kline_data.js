const path = require('path');

const initProcess = require('../src/libs/init_process');
const getKlineData = require('../src/controller/kline');


async function getKlineDataEntrance({ symbolList, interval, startTime, endTime, outputFolder }) {
  await initProcess(process, 'getklinedata');

  let targetOutputFolder = outputFolder;
  if (!path.isAbsolute(outputFolder)) {
    targetOutputFolder = path.join(process.cwd(), outputFolder);
  }


  await getKlineData({
    symbolList,
    interval,
    startTime,
    endTime,
    outputFolder: targetOutputFolder,
  });
}

module.exports = getKlineDataEntrance;

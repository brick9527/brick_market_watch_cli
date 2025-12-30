const BrickProcess = require('../src/libs/init_process');
new BrickProcess(process, 'getklinedata');

const path = require('path');

const getKlineData = require('../src/controller/kline');


async function getKlineDataEntrance({ symbolList, interval, startTime, endTime, outputFolder }) {

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

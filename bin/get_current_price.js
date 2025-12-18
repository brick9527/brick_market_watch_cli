const { getTrickerPrice } = require('../src/controller/watch/index');
const initProcess = require('../src/libs/init_process');

async function getCurrentPrice() {
  await initProcess(process, 'getcurrentprice');

  await getTrickerPrice({
    symbolList: process.brickMarketWatchCli.ctx.config.symbols,
    enableCheckNotice: true,
    sendDingtalkMsg: true
  });
}

if (require.main === module) {
  getCurrentPrice();
}

module.exports = getCurrentPrice;
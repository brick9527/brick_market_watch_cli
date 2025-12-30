const BrickProcess = require('../src/libs/init_process');
new BrickProcess(process, 'getcurrentprice');

const { getTrickerPrice } = require('../src/controller/watch/index');

async function getCurrentPrice() {

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
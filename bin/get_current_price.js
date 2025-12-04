require('dotenv').config();
require('../src/libs/init_process')(process, 'getcurrentprice');

const { getTrickerPrice } = require('../src/controller/watch/index');

async function getCurrentPrice() {

  await getTrickerPrice({
    symbolList: process.brickMarketWatchCli.ctx.config.symbols,
    enableCheckNotice: true,
    sendDingtalkMsg: true
  });
}

if (require.main === module) {
  getCurrentPrice(process.brickMarketWatchCli.ctx.spotClient);
}

module.exports = getCurrentPrice;
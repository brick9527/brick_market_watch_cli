require('dotenv').config();
require('../src/libs/init_process')(process, 'watch');

const { getSymbolAvgPrice, getTrickerPrice } = require('../src/controller/watch/index');

async function run(spotClient) {
  // await getSymbolAvgPrice(config.symbols);

  await getTrickerPrice({
    symbolList: process.brickMarketWatchCli.ctx.config.symbols,
    enableCheckNotice: true,
    sendDingtalkMsg: true
  });
}

if (require.main === module) {
  run(process.brickMarketWatchCli.ctx.spotClient);
}

module.exports = run;
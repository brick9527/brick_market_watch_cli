require('dotenv').config();
require('../src/libs/init_process')(process, 'watch');

const { getTrickerPrice } = require('../src/controller/watch/index');

async function run() {

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
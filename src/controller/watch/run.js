const { getSymbolAvgPrice, getTrickerPrice } = require('./watch');

const config = require('../../../config.json');

async function run() {
  // await getSymbolAvgPrice(config.symbols);

  await getTrickerPrice(config.symbols, true, true);
}

run();
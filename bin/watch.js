require('dotenv').config();

const { getSymbolAvgPrice, getTrickerPrice } = require('../src/controller/watch/index');

const config = require('../config.json');

async function run() {
  // await getSymbolAvgPrice(config.symbols);

  await getTrickerPrice(config.symbols, true, true);
}

run();
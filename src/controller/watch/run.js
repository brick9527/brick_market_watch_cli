const { getSymbolAvgPrice, getTrickerPrice } = require('./watch');

async function run() {
  const symbolList = ['BTCUSDT', 'SOLUSDT'];
  await getSymbolAvgPrice(symbolList);

  await getTrickerPrice(symbolList);
}

run();
require('dotenv').config();

const { getSymbolAvgPrice, getTrickerPrice } = require('../src/controller/watch/index');

const config = require('../config.json');

async function run(spotClient) {
  // await getSymbolAvgPrice(spotClient, config.symbols);

  await getTrickerPrice(spotClient, config.symbols, true, true);
}


if (require.main === module) {
  const getClient = require('../src/util/binance_spot_client');
  const getProxyConfig = require('../src/libs/get_proxy');
  const proxyConfig = getProxyConfig();
  const spotClient = getClient(proxyConfig);
  run(spotClient);
}

module.exports = run;
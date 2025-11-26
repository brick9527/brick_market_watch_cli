require('dotenv').config();

const getAccount = require("../src/controller/get_account/index");

if (require.main === module) {
  const getClient = require('../src/util/binance_spot_client');
  const getProxyConfig = require('../src/libs/get_proxy');
  const proxyConfig = getProxyConfig();
  const spotClient = getClient(proxyConfig);

  getAccount(spotClient);
}

module.exports = getAccount;
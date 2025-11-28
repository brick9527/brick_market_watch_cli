const { Spot, SPOT_REST_API_PROD_URL } = require('@binance/spot');

const config = require('../../config.json');

function getClient (proxyConfig) {
  const configurationRestAPI = {
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
    basePath: config.basePath || SPOT_REST_API_PROD_URL,
    ...proxyConfig,
  };

  const client = new Spot({ configurationRestAPI });

  return client;
}

module.exports = getClient;

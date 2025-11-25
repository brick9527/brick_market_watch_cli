const { Spot, SPOT_REST_API_PROD_URL } = require("@binance/spot");

const config = require("../../config.json");

const configurationRestAPI = {
  apiKey: config.apiKey,
  apiSecret: config.apiSecret,
  basePath: config.basePath || SPOT_REST_API_PROD_URL,
  proxy: {
    host: config.proxy.host,
    port: config.proxy.port,
    protocol: config.proxy.protocol,
  },
};

const client = new Spot({ configurationRestAPI });

module.exports = client;

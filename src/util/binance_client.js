const { Spot } = require('@binance/connector');

const config = require('../../config.json');


/**
 * 创建币安客户端实例
 * @param {Object} arg - 命令行参数
 * @param {Object} flags - 命令行flags
 * @param {String} apiKey - 币安apiKey
 * @param {String} apiSecret - 币安apiSecret
 * @param {Object} proxy - 代理配置
 * @returns {Object} 币安客户端实例
 */
function createClient({ isProd = false, apiKey, apiSecret, proxy } = {}) {

  const params = {};

  if (proxy) {
    params.proxy = proxy;
  } else {
    params.proxy = config.proxy;
  }

  if (!isProd) {
    params.baseURL = 'https://testnet.binance.vision';
  }
  
  const client = new Spot(apiKey, apiSecret, params);

  return client;
}

module.exports = createClient;

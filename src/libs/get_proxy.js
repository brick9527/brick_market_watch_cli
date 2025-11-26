
const config = require('../../config.json');

function getProxyConfig() {
  const proxyConfig = config.proxy;

  if (!proxyConfig) {
    return {};
  }

  if (!proxyConfig.protocol || !proxyConfig.host || !proxyConfig.port) {
    return {};
  }

  return {
    proxy: {
      protocol: proxyConfig.protocol,
      host: proxyConfig.host,
      port: proxyConfig.port,
    },
  };
}

module.exports = getProxyConfig;

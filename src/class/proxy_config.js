// TODO: 这个要改
const path = require('path');

class ProxyConfig {
  proxyConfig = {
    protocol: null,
    host: null,
    port: null,
  };

  constructor(filePath = '../../config.json') {

    try {
      const config = require(path.join(__dirname, filePath));
      const proxyConfig = config.proxy;

      if (!proxyConfig) {
        return this;
      }

      if (!proxyConfig.protocol || !proxyConfig.host || !proxyConfig.port) {
        return this;
      }

      this.proxyConfig = config.proxy;

      return this;
    } catch (error) {
      throw new Error(`初始化代理配置文件失败：${error.message}`);
    }
  }

  getJSON() {
    return this.proxyConfig;
  }

  parse(proxyConfig) {
    if (!proxyConfig) {
      return this;
    }

    if (!proxyConfig.protocol || !proxyConfig.host || !proxyConfig.port) {
      return this;
    }

    this.proxyConfig = proxyConfig;

    return this;
  }
}

module.exports = ProxyConfig;

const path = require('path');

class Config {
  config = {};

  constructor(filePath = '../../config.json') {
    try {
      this.config = require(path.join(__dirname, filePath));
      return this;
    } catch (error) {
      throw new Error(`初始化配置文件失败：${error.message}`);
    }
  }

  getJSON() {
    return this.config;
  }

  parse(config) {
    if (!config) {
      return this;
    }

    this.config = config;
    return this;
  }
}

module.exports = Config;
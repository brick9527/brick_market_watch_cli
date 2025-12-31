const path = require('path');
const _ = require('lodash');

class NoticeConfig {
  noticeConfig = {
    warning_target: [],
    info_target: [],
  };

  constructor(filePath = '../../notice.json') {

    try {
      this.noticeConfig = require(path.join(__dirname, filePath));
      return this;
    } catch (error) {
      throw new Error(`初始化通知配置文件失败：${error.message}`);
    }
  }

  getJSON() {
    return this.noticeConfig;
  }

  parse(noticeConfig) {
    if (!noticeConfig) {
      return this;
    }

    this.noticeConfig = noticeConfig;
    return this;
  }

  updateEnable({ type, propertyPath, enable }) {
    _.set(this, `noticeConfig.${type}.${propertyPath}`, enable);
  }
}

module.exports = NoticeConfig;
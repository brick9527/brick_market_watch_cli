const path = require('path');

class ScheduleConfig {
  scheduleConfig = {};

  constructor(filePath = '../../schedule.json') {

    try {
      this.scheduleConfig = require(path.join(__dirname, filePath));
      return this;
    } catch (error) {
      throw new Error(`初始化调度配置文件失败：${error.message}`);
    }
  }

  getJSON() {
    return this.scheduleConfig;
  }

  parse(scheduleConfig) {
    if (!scheduleConfig) {
      return this;
    }

    this.scheduleConfig = scheduleConfig;
    return this;
  }
}

module.exports = ScheduleConfig;

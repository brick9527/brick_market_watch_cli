const saveNoticeConfig = require('../../libs/save_notice_config');

// TODO: 后续这部分更新noticeConfig的操作交给数据库来更新
function changeNoticeConfigEnable(triggerToCloseList = [], triggerToOpenList = []) {
  /**
   * noticeGroup = {
   *  BTCUSDT: {
   *    warningMsg: [],
   *    infoMsg: [],
   *  },
   * ...
   * }
   */
  const noticeConfig = process.brickMarketWatchCli.ctx.noticeConfig;
  const noticeConfigEntry = process.brickMarketWatchCli.class.noticeConfig;

  const warningTargetGroup = noticeConfig.warning_target;
  const infoTargetGroup = noticeConfig.info_target;

  // 设置warningg_target
  for (const warningTargetKey of Object.keys(warningTargetGroup)) {
    const warningTargetInfoList = warningTargetGroup[warningTargetKey];

    for (let i = 0; i < warningTargetInfoList.length; i++) {
      const warningTargetItem = warningTargetInfoList[i];

      if (triggerToCloseList.includes(warningTargetItem.name)) {
        noticeConfigEntry.updateEnable({
          type: 'warning_target',
          propertyPath: `${warningTargetKey}.${i}.enable`,
          enable: false,
        });
      }

      if (triggerToOpenList.includes(warningTargetItem.name)) {
        noticeConfigEntry.updateEnable({
          type: 'warning_target',
          propertyPath: `${warningTargetKey}.${i}.enable`,
          enable: true,
        });
      }
    }
  }

  // 设置info_target
  for (const infoTargetKey of Object.keys(infoTargetGroup)) {
    const infoTargetInfoList = infoTargetGroup[infoTargetKey];

    for (let i = 0; i < infoTargetInfoList.length; i++) {
      const infoTargetItem = infoTargetInfoList[i];
      
      if (triggerToCloseList.includes(infoTargetItem.name)) {
        noticeConfigEntry.updateEnable({
          type: 'info_target',
          propertyPath: `${infoTargetKey}.${i}.enable`,
          enable: false,
        });
      }

      if (triggerToOpenList.includes(infoTargetItem.name)) {
        noticeConfigEntry.updateEnable({
          type: 'info_target',
          propertyPath: `${infoTargetKey}.${i}.enable`,
          enable: true,
        });
      }
    }
  }

  process.brickMarketWatchCli.ctx.noticeConfig = noticeConfigEntry.getJSON();

  // 保存到配置文件
  saveNoticeConfig(noticeConfig);
}

module.exports = changeNoticeConfigEnable;

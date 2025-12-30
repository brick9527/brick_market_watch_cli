const _ = require('lodash');

const saveNoticeConfig = require('../../DAO/save_notice_config');

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

  const warningTargetGroup = noticeConfig.warning_target;
  const infoTargetGroup = noticeConfig.info_target;

  // 设置warningg_target
  for (const warningTargetKey of Object.keys(warningTargetGroup)) {
    const warningTargetInfoList = warningTargetGroup[warningTargetKey];

    for (let i = 0; i < warningTargetInfoList.length; i++) {
      const warningTargetItem = warningTargetInfoList[i];

      if (triggerToCloseList.includes(warningTargetItem.name)) {
        _.set(noticeConfig, `warning_target.${warningTargetKey}.${i}.enable`, false);
      }

      if (triggerToOpenList.includes(warningTargetItem.name)) {
        _.set(noticeConfig, `warning_target.${warningTargetKey}.${i}.enable`, true);
      }
    }
  }

  // 设置info_target
  for (const infoTargetKey of Object.keys(infoTargetGroup)) {
    const infoTargetInfoList = infoTargetGroup[infoTargetKey];

    for (let i = 0; i < infoTargetInfoList.length; i++) {
      const infoTargetItem = infoTargetInfoList[i];
      
      if (triggerToCloseList.includes(infoTargetItem.name)) {
        _.set(noticeConfig, `info_target.${infoTargetKey}.${i}.enable`, false);
      }

      if (triggerToOpenList.includes(infoTargetItem.name)) {
        _.set(noticeConfig, `info_target.${infoTargetKey}.${i}.enable`, true);
      }
    }
  }

  // 保存到配置文件
  saveNoticeConfig(noticeConfig);
}

module.exports = changeNoticeConfigEnable;

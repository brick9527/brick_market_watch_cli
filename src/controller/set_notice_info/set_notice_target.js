const logger = process.brickMarketWatchCli.ctx.logger;
const saveNoticeConfig = require('../../libs/save_notice_config');

function getNoticeTarget(noticeTargetConfig) {

  // 检查config参数
  const topLevelKeys = ['warning_target', 'info_target'];
  for (const key of topLevelKeys) {
    if (!noticeTargetConfig[key]) {
      logger.error(`noticeTargetConfig 中缺少${key}`);
      return;
    }

    const target = noticeTargetConfig[key];

    for (const symbol in target) {
      if (!target[symbol] || typeof target[symbol] !== 'object') {
        logger.error(`noticeTargetConfig 中的${key}格式无效`);
        return;
      }

      for (const item of target[symbol]) {
        if (typeof item.enable !== 'boolean' ||
          typeof item.price !== 'string' ||
          typeof item.name !== 'string' ||
          typeof item.desc !== 'string') {
          logger.error(`noticeTargetConfig 中的${key}格式无效`);
          return;
        }
      }
    }
  }

  process.brickMarketWatchCli.ctx.noticeConfig = {
    expire: process.brickMarketWatchCli.ctx.noticeConfig.expire,
    ...noticeTargetConfig,
  }

  // 存储到配置文件
  saveNoticeConfig(process.brickMarketWatchCli.ctx.noticeConfig);

  return process.brickMarketWatchCli.ctx.noticeConfig;
}

module.exports = getNoticeTarget;
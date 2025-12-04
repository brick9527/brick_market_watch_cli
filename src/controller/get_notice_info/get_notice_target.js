function getNoticeTarget() {
  const { warning_target, info_target } = process.brickMarketWatchCli.ctx.noticeConfig;

  return { warning_target, info_target };
}

module.exports = getNoticeTarget;
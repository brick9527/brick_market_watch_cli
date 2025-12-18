const logger = process.brickMarketWatchCli.ctx.logger;

const setNoticeTarget = require('../src/controller/set_notice_info/set_notice_target');
const getNoticeTarget = require('../src/controller/get_notice_info/get_notice_target');
const generateNoticeTargetTable = require('../src/libs/table/notice_target');
const initProcess = require('../src/libs/init_process');


async function runSetNoticeTarget(noticeTargetConfig) {
  await initProcess(process, 'setnoticetarget');

  setNoticeTarget(noticeTargetConfig);

  logger.info('设置通知目标成功');

  const { warning_target, info_target } = getNoticeTarget();

  const tableObject = generateNoticeTargetTable({ warning_target, info_target });
  console.log(tableObject.toString());
}

if (require.main === module) {
  runSetNoticeTarget();
}

module.exports = runSetNoticeTarget;

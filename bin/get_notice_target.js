const BrickProcess = require('../src/libs/init_process');
new BrickProcess(process, 'getnoticetarget');

const getNoticeTarget = require('../src/controller/get_notice_info/get_notice_target');
const generateNoticeTargetTable = require('../src/libs/table/notice_target');

async function runGetNoticeTarget(enableJSON = false) {

  const { warning_target, info_target } = getNoticeTarget();

  if (enableJSON) {
    const targetInfo = { warning_target, info_target };
    console.log(JSON.stringify(targetInfo, null, 2));
    return targetInfo;
  }
  
  const tableObject = generateNoticeTargetTable({ warning_target, info_target });
  const targetContent = tableObject.toString();
  console.log(targetContent);
  return targetContent;
}

if (require.main === module) {
  runGetNoticeTarget();
}

module.exports = runGetNoticeTarget;
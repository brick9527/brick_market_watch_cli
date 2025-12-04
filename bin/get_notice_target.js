require('dotenv').config();
require('../src/libs/init_process')(process, 'getnoticetarget');

const getNoticeTarget = require('../src/controller/get_notice_info/get_notice_target');
const generateNoticeTargetTable = require('../src/libs/table/notice_target');

function runGetNoticeTarget() {
  const { warning_target, info_target } = getNoticeTarget();


  console.log({ warning_target, info_target });

  const tableObject = generateNoticeTargetTable({ warning_target, info_target });
  console.log(tableObject.toString());
}

if (require.main === module) {
  runGetNoticeTarget();
}

module.exports = runGetNoticeTarget;
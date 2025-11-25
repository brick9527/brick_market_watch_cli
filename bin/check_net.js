require('dotenv').config();

const checkNet = require('../src/controller/check_net/index');
const checkBn = require('../src/controller/check_net/check_bn');
const logger = require('../src/util/log4js').getLogger('checknet');

async function run() {

  logger.info('=============检查网络信息=============');
  await checkNet();

  logger.info('=============检查binance通讯=============');
  try {
    const pingResult = await checkBn();

    logger.info(`binance 连接状态： ${pingResult.status ? '正常' : '失联'}`)
  } catch (err) {
    logger.error(err);
  }

}


if (require.main === module) {
  run();
}

module.exports = runSchedule;
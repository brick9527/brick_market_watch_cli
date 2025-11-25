require('dotenv').config();

const checkNet = require('../src/controller/check_net/index');
const checkBn = require('../src/controller/check_net/check_bn');
const logger = require('../src/util/log4js').getLogger('checknet');

async function run() {

  console.log('=============检查网络信息=============');
  await checkNet();

  console.log('=============检查binance通讯=============');
  try {
    const pingResult = await checkBn();

    console.log(`binance 连接状态： ${pingResult.status ? '正常' : '失联'}`)
  } catch (err) {
    console.log(err);
  }

  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');


}

run();
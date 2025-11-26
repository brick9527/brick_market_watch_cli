const config = require('../../config.json');
const noticeConfig = require('../../notice.json');
const scheduleConfig = require('../../schedule.json');

const getLogger = require('../util/log4js').getLogger;
const logger = getLogger('init_process');
const { prodDingTalkRobot, monitorDingTalkRobot } = require('../util/dingtalk');
const getProxyConfig = require('./get_proxy');
const getSpotClient = require('../util/binance_spot_client');

function initProcess(process, processName = 'default') {
  logger.debug('开始初始化进程数据...');

  const proxyConfig = getProxyConfig();
  process.brickMarketWatchCli = {
    // 进程名称
    name: processName,
    
    // 上下文
    ctx: {
      config,
      noticeConfig,
      scheduleConfig,
      proxyConfig,
      logger: getLogger(processName),
      dingtalk: {
        prodDingTalkRobot,
        monitorDingTalkRobot,
      },
      spotClient: getSpotClient(proxyConfig),
    },

    // 变量
    variables: {}, 
  };

  logger.info('初始化进程数据完成');
}

module.exports = initProcess;
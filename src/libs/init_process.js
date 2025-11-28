const config = require('../../config.json');
const noticeConfig = require('../../notice.json');
const scheduleConfig = require('../../schedule.json');

const getLogger = require('../util/log4js').getLogger;
const logger = getLogger('init_process');
const { prodDingTalkRobot, monitorDingTalkRobot } = require('../util/dingtalk');
const getProxyConfig = require('./get_proxy');
const getSpotClient = require('../util/binance_spot_client');

const IGNORE_ERR = require('../../ignore_err.json');
const IGNORE_ERR_CODE = require('../../ignore_err_code.json');

function initProcess(process, processName = 'default') {
  if (process.brickMarketWatchCli) {
    logger.warn(`已经初始化process：${process.brickMarketWatchCli.name}, 跳过本次初始化`);
    return;
  }
  
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
    variables: {
      disableNoticeSymbolSet: {},
    },
  };

  // 1. 捕获同步/回调异步中的未捕获错误
  process.on('uncaughtException', (error) => {
    let msg = '未捕获的同步/回调异步错误：\n';
    msg += `错误信息：${error.message}\n`;
    msg += `错误堆栈：${error.stack}\n`;
    msg += `错误码：${error.code}\n`; // 错误标识（如 ETIMEDOUT、ECONNREFUSED）
    
    process.brickMarketWatchCli.ctx.logger.error(msg);

    if (!IGNORE_ERR_CODE.includes(error.code)) {
      monitorDingTalkRobot.sendText(`${process.brickMarketWatchCli.name}\n ${msg}`);
    }
  });

  // 2. 捕获 Promise 未处理的拒绝（最容易遗漏的场景）
  process.on('unhandledRejection', (reason, promise) => {
    let msg = '未处理的 Promise 拒绝：\n';

    const errReason = reason instanceof Error ? reason.message : reason;
    msg += `拒绝原因：${errReason}\n`;
    msg += `关联的 Promise：${promise}\n`;
    msg += `错误堆栈：${reason instanceof Error ? reason.stack : '无'}\n`;

    process.brickMarketWatchCli.ctx.logger.error(msg);

    // // 处理建议：同样做清理工作，避免内存泄漏或资源占用
    // cleanUpResources().then(() => {
    //   process.exit(1);
    // });

    // 发送钉钉通知
    if (!IGNORE_ERR.includes(errReason)) {
      monitorDingTalkRobot.sendText(`${process.brickMarketWatchCli.name}\n ${msg}`);
    }

  });

  logger.info('初始化进程数据完成');
}

module.exports = initProcess;

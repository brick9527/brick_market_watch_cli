const BrickProcess = require('../src/libs/init_process');
const brickProcess = new BrickProcess(process, 'entrypoint');

const dayjs = require('dayjs');
const _ = require('lodash');
const nodeSchedule = require('node-schedule');

const runCheckNet = require('./check_net');
const { getTrickerPrice } = require('../src/controller/watch/index');

// 先存到内存中，保留最新的20条记录
let processCache = [];

async function entrypoint() {
  await brickProcess.createMongoClient();

  const { spotClient } = process.brickMarketWatchCli.ctx;

  // TODO: 检查代理连接状态，如果无法连接，则不使用代理创建spotClient
  
  // 注册轮询
  await _scheduleCheckNet();
  await _scheduleCountStatus();

  // 检查网络状态
  await runCheckNet(spotClient);

  // 盯盘
  await _scheduleWatch(spotClient);
}

async function _scheduleWatch() {
  const { scheduleConfig, config } = process.brickMarketWatchCli.ctx;
  const interval = scheduleConfig.interval;

  nodeSchedule.scheduleJob(interval, async () => {

    await getTrickerPrice({
      symbolList: config.symbols,
      enableCheckNotice: true,
      sendDingtalkMsg: true
    });
  });
}

async function _scheduleCheckNet() {
  const { scheduleConfig, spotClient } = process.brickMarketWatchCli.ctx;

  const checkNetInterval = scheduleConfig.check_net_interval;

  nodeSchedule.scheduleJob(checkNetInterval, async () => {
    const checkResult = await runCheckNet(spotClient);

    processCache.push({
      ...checkResult,
      timestamp: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    });
  });
}

async function _scheduleCountStatus() {
  const { scheduleConfig, logger } = process.brickMarketWatchCli.ctx;
  const { monitorDingTalkRobot } = process.brickMarketWatchCli.ctx.dingtalk;
  const countStatusInterval = scheduleConfig.count_status_interval;

  nodeSchedule.scheduleJob(countStatusInterval, async () => {
    // 截取最后20条记录
    processCache = processCache.slice(-20);

    const pingStatusCount = {
      failed: 0,
      success: 0,
      total: 0,
    };
    const proxyStatusCount = {
      failed: 0,
      success: 0,
      total: 0,
    };
    for (const cacheItem of processCache) {
      pingStatusCount.total++;
      proxyStatusCount.total++;

      if (cacheItem.pingStatus) {
        pingStatusCount.success++;
      } else {
        pingStatusCount.failed++;
      }

      if (cacheItem.proxyStatus) {
        proxyStatusCount.success++;
      } else {
        proxyStatusCount.failed++;
      }
    }

    // 计算成功率
    const pingSuccessRate = (
      (pingStatusCount.success / pingStatusCount.total) *
      100
    ).toFixed(2);
    const proxySuccessRate = (
      (proxyStatusCount.success / proxyStatusCount.total) *
      100
    ).toFixed(2);

    // 最后一次代理信息
    const latestIpInfo = _.last(processCache);
    if (!latestIpInfo) {
      logger.warn('没有缓存数据，跳过本次消息发送');
      return;
    }

    let msgContent = `【巡检信息】<${dayjs().format('YYYY-MM-DD HH:mm:ss')}>\n`;
    msgContent += `时间段：[${_.first(processCache)?.timestamp}, ${
      _.last(processCache)?.timestamp
    }]\n`;
    msgContent += '# 代理检测\n';
    msgContent += `  成功率: ${proxySuccessRate} % (tcp连接)\n`;
    msgContent += `  最后一次代理状态: ${
      latestIpInfo.isProxyExist ? '存在' : '不存在'
    }\n`;
    msgContent += '# ping检测\n';
    msgContent += `  成功率: ${pingSuccessRate} % (ping方法)\n`;
    msgContent += `  最后一次ping结果: ${
      latestIpInfo.pingStatus ? '成功' : '失败'
    }\n`;
    msgContent += '# 最近一次网络信息\n';
    msgContent += `  ${JSON.stringify(
      _.get(latestIpInfo, 'IPInfoList', []),
      null,
      2
    )} \n`;

    logger.info(msgContent);
    // 判断是不是在每日约定时间
    const countStatusTimerange = scheduleConfig.count_status_timerange || [
      9, 21,
    ];
    if (
      dayjs().hour() >= _.first(countStatusTimerange) &&
      dayjs().hour() <= _.last(countStatusTimerange)
    ) {
      await monitorDingTalkRobot.sendText(msgContent);
    }
  });
}

if (require.main === module) {
  entrypoint();
}

module.exports = entrypoint;

require("dotenv").config();
require('../src/libs/init_process')(process, 'entrypoint');

const dayjs = require("dayjs");
const _ = require("lodash");
const nodeSchedule = require("node-schedule");

const runCheckNet = require("./check_net");
const { getTrickerPrice } = require("../src/controller/watch/index");

const processObject = process.brickMarketWatchCli;
const logger = processObject.ctx.logger;
const monitorDingTalkRobot = processObject.ctx.dingtalk.monitorDingTalkRobot;
const spotClient = processObject.ctx.spotClient;

// 先存到内存中，保留最新的20条记录
let processCache = [];

async function entrypoint() {
  // TODO: 检查代理连接状态，如果无法连接，则不使用代理创建spotClient
  
  // 注册轮询
  await _scheduleCheckNet();
  await _scheduleCountStatus();

  // 检查网络状态
  await runCheckNet(spotClient);

  // 盯盘
  await _scheduleWatch(spotClient);
}

async function _scheduleWatch(spotClient) {
  const scheduleConfig = processObject.ctx.scheduleConfig;

  const interval = scheduleConfig.interval;

  nodeSchedule.scheduleJob(interval, async () => {

    const config = processObject.ctx.config;

    await getTrickerPrice({
      spotClient,
      symbolList: config.symbols,
      enableCheckNotice: true,
      sendDingtalkMsg: true
    });
  });
}

async function _scheduleCheckNet() {
  const scheduleConfig = processObject.ctx.scheduleConfig;

  const checkNetInterval = scheduleConfig.check_net_interval;

  nodeSchedule.scheduleJob(checkNetInterval, async () => {
    const checkResult = await runCheckNet(spotClient);

    processCache.push({
      ...checkResult,
      timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    });
  });
}

async function _scheduleCountStatus() {
  const scheduleConfig = processObject.ctx.scheduleConfig;

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
      logger.warn("没有缓存数据，跳过本次消息发送");
      return;
    }

    let msgContent = `【巡检信息】<${dayjs().format("YYYY-MM-DD HH:mm:ss")}>\n`;
    msgContent += `时间段：[${_.first(processCache)?.timestamp}, ${
      _.last(processCache)?.timestamp
    }]\n`;
    msgContent += "# 代理检测\n";
    msgContent += `  成功率: ${proxySuccessRate} % (tcp连接)\n`;
    msgContent += `  最后一次代理状态: ${
      latestIpInfo.isProxyExist ? "存在" : "不存在"
    }\n`;
    msgContent += "# ping检测\n";
    msgContent += `  成功率: ${pingSuccessRate} % (ping方法)\n`;
    msgContent += `  最后一次ping结果: ${
      latestIpInfo.pingStatus ? "成功" : "失败"
    }\n`;
    msgContent += "# 最近一次网络信息\n";
    msgContent += `  ${JSON.stringify(
      _.get(latestIpInfo, "IPInfoList", []),
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

// 1. 捕获同步/回调异步中的未捕获错误
process.on('uncaughtException', (error) => {
  logger.error('未捕获的同步/回调异步错误：');
  logger.error('错误信息：', error.message);
  logger.error('错误堆栈：', error.stack); // 关键：打印堆栈，方便定位代码
  logger.error('错误码：', error.code); // 错误标识（如 ETIMEDOUT、ECONNREFUSED）

  // // 重要：触发 uncaughtException 后，进程状态可能不稳定，建议做清理工作后退出
  // // 例如：关闭数据库连接、释放文件句柄
  // cleanUpResources().then(() => {
  //   process.exit(1); // 非 0 退出码表示异常退出（方便监控告警）
  // });
});

// 2. 捕获 Promise 未处理的拒绝（最容易遗漏的场景）
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的 Promise 拒绝：');
  logger.error('拒绝原因：', reason instanceof Error ? reason.message : reason);
  logger.error('关联的 Promise：', promise);
  logger.error('错误堆栈：', reason instanceof Error ? reason.stack : '无');

  // // 处理建议：同样做清理工作，避免内存泄漏或资源占用
  // cleanUpResources().then(() => {
  //   process.exit(1);
  // });
});

entrypoint();

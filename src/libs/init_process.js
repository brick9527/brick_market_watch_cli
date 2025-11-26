const config = require("../../config.json");
const noticeConfig = require("../../notice.json");
const scheduleConfig = require("../../schedule.json");

const getLogger = require("../util/log4js").getLogger;
const logger = getLogger("init_process");
const { prodDingTalkRobot, monitorDingTalkRobot } = require("../util/dingtalk");
const getProxyConfig = require("./get_proxy");
const getSpotClient = require("../util/binance_spot_client");

function initProcess(process, processName = "default") {
  logger.debug("开始初始化进程数据...");

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

  // 1. 捕获同步/回调异步中的未捕获错误
  process.on("uncaughtException", (error) => {
    process.brickMarketWatchCli.ctx.logger.error("未捕获的同步/回调异步错误：");
    process.brickMarketWatchCli.ctx.logger.error("错误信息：", error.message);
    process.brickMarketWatchCli.ctx.logger.error("错误堆栈：", error.stack); // 关键：打印堆栈，方便定位代码
    process.brickMarketWatchCli.ctx.logger.error("错误码：", error.code); // 错误标识（如 ETIMEDOUT、ECONNREFUSED）

    // // 重要：触发 uncaughtException 后，进程状态可能不稳定，建议做清理工作后退出
    // // 例如：关闭数据库连接、释放文件句柄
    // cleanUpResources().then(() => {
    //   process.exit(1); // 非 0 退出码表示异常退出（方便监控告警）
    // });
  });

  // 2. 捕获 Promise 未处理的拒绝（最容易遗漏的场景）
  process.on("unhandledRejection", (reason, promise) => {
    process.brickMarketWatchCli.ctx.logger.error("未处理的 Promise 拒绝：");
    process.brickMarketWatchCli.ctx.logger.error(
      "拒绝原因：",
      reason instanceof Error ? reason.message : reason
    );
    process.brickMarketWatchCli.ctx.logger.error("关联的 Promise：", promise);
    process.brickMarketWatchCli.ctx.logger.error("错误堆栈：", reason instanceof Error ? reason.stack : "无");

    // // 处理建议：同样做清理工作，避免内存泄漏或资源占用
    // cleanUpResources().then(() => {
    //   process.exit(1);
    // });
  });

  logger.info("初始化进程数据完成");
}

module.exports = initProcess;

require("dotenv").config();

const getProxyConfig = require("../src/libs/get_proxy");
const checkNet = require("../src/controller/check_net/index");
const checkBn = require("../src/controller/check_net/check_bn");
const checkProxy = require("../src/controller/check_net/check_proxy");
const logger = require("../src/util/log4js").getLogger("checknet");

async function run(spotClient) {
  const result = {
    IPInfoList: [],
    pingStatus: false,
    isProxyExist: true,
    proxyStatus: false,
  };

  const proxyConfig = getProxyConfig();
  result.isProxyExist = true;
  logger.info("=============检查代理通信=============");
  if (proxyConfig?.proxy?.host && proxyConfig?.proxy?.port) {

    logger.info('代理配置：存在');
    try {
      const checkProxyResult = await checkProxy(proxyConfig?.proxy?.host, proxyConfig?.proxy?.port);
      logger.info(
        `代理连接状态： ${checkProxyResult.success ? "成功" : "失败"}`
      );
      result.proxyStatus = checkProxyResult.success;
    } catch (err) {
      logger.error(err);
    }
  } else {
    result.isProxyExist = false;
    logger.info('代理状态：不存在');
  }

  try {
    logger.info("=============检查网络信息=============");
    result.IPInfoList = await checkNet(result.proxyStatus ? proxyConfig : {});
  } catch (err) {
    logger.info('网络信息获取状态：失败');
    logger.error(err);
  }

  logger.info("=============检查binance通讯=============");
  try {
    const pingResult = await checkBn(spotClient);
    result.pingStatus = pingResult;
    logger.info(`binance 连接状态： ${pingResult.status ? "成功" : "失败"}`);
  } catch (err) {
    logger.info('binance 连接状态：失败');
    logger.error(err);
  }

  return result;
}

if (require.main === module) {
  const getClient = require('../src/util/binance_spot_client');
  const getProxyConfig = require('../src/libs/get_proxy');
  const proxyConfig = getProxyConfig();
  const spotClient = getClient(proxyConfig);
  run(spotClient);
}

module.exports = run;

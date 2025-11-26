require('dotenv').config();

const nodeSchedule = require("node-schedule");
const path = require("path");

const { readFile } = require("../src/util/file");
const { getTrickerPrice } = require("../src/controller/watch/index");

async function runSchedule(spotClient) {
  const scheduleConfigRawContent = readFile(
    "schedule.json",
    path.join(__dirname, "../")
  );
  const scheduleConfig = JSON.parse(scheduleConfigRawContent);

  const interval = scheduleConfig.interval;

  nodeSchedule.scheduleJob(interval, async () => {

    const configRawContent = readFile("config.json", path.join(__dirname, "../"));
    const config = JSON.parse(configRawContent);

    await getTrickerPrice(spotClient, config.symbols, true, true);
  });
}

if (require.main === module) {
  const getClient = require('../src/util/binance_spot_client');
  const getProxyConfig = require('../src/libs/get_proxy');
  const proxyConfig = getProxyConfig();
  const spotClient = getClient(proxyConfig);

  runSchedule(spotClient);
}

module.exports = runSchedule;


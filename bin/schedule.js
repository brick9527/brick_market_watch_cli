require('dotenv').config();

const nodeSchedule = require("node-schedule");
const path = require("path");

const { readFile } = require("../src/util/file");
const { getTrickerPrice } = require("../src/controller/watch/index");

async function runSchedule() {
  const scheduleConfigRawContent = readFile(
    "schedule.json",
    path.join(__dirname, "../")
  );
  const scheduleConfig = JSON.parse(scheduleConfigRawContent);

  const interval = scheduleConfig.interval;

  nodeSchedule.scheduleJob(interval, async () => {

    const configRawContent = readFile("config.json", path.join(__dirname, "../"));
    const config = JSON.parse(configRawContent);

    await getTrickerPrice(config.symbols, true, true);
  });
}

if (require.main === module) {
  runSchedule();
}

module.exports = runSchedule;


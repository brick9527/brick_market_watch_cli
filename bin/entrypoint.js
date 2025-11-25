require('dotenv').config();

const runSchedule = require('./schedule');
const runCheckNet = require('./check_net');

async function entrypoint() {
  // 检查
  await runCheckNet();

  // 盯盘
  await runSchedule();
}

entrypoint();
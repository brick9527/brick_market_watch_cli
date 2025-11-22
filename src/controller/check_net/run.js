const checkNet = require('./index');
// const getAccount = require("../get_account/index");
const checkBn = require("./check_bn");

async function run() {

  console.log("=============检查网络信息=============");
  await checkNet();

  console.log("=============检查binance通讯=============");
  try {
    const pingResult = await checkBn();

    console.log(`binance 连接状态： ${pingResult.status ? '正常' : '失联'}`)
  } catch (err) {
    console.log(err);
  }

}

run();
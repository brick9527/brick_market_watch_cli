const getAccount = require('../src/controller/get_account/index');
const initProcess = require('../src/libs/init_process');

async function runGetAccount() {
  await initProcess(process, 'getaccount');
  await getAccount(process.brickMarketWatchCli.ctx.spotClient);
}

if (require.main === module) {
  
  runGetAccount();
}

module.exports = runGetAccount;
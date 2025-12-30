const BrickProcess = require('../src/libs/init_process');
new BrickProcess(process, 'getaccount');

const getAccount = require('../src/controller/get_account/index');

async function runGetAccount() {
  await getAccount(process.brickMarketWatchCli.ctx.spotClient);
}

if (require.main === module) {
  
  runGetAccount();
}

module.exports = runGetAccount;
require('dotenv').config();
require('../src/libs/init_process')(process, 'getaccount');

const getAccount = require("../src/controller/get_account/index");

if (require.main === module) {

  getAccount(process.brickMarketWatchCli.ctx.spotClient);
}

module.exports = getAccount;
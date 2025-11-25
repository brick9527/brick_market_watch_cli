require('dotenv').config();

const getAccount = require("../src/controller/get_account/index");

if (require.main === module) {
  getAccount();
}

module.exports = runSchedule;
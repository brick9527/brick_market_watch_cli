const spotClient = require("../../util/binance_spot_client");
const logger = require('../../util/log4js').getLogger('getaccount');

async function getAccount() {
  const response = await spotClient.restAPI.getAccount();
  // logger.info(response.rateLimits);

  logger.info(await response.data());
}

module.exports = getAccount;
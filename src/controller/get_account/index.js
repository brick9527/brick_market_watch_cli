const logger = require('../../util/log4js').getLogger('getaccount');

async function getAccount(spotClient) {
  const response = await spotClient.restAPI.getAccount();
  // logger.info(response.rateLimits);

  logger.info(await response.data());
}

module.exports = getAccount;
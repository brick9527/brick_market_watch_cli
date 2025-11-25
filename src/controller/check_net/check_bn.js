const spotClient = require("../../util/binance_spot_client");
const logger = require('../../util/log4js').getLogger('checkbn');

async function checkBn() {
  const response = await spotClient.restAPI.ping();
  // logger.debug(response);

  return {
    status: response.status,
  }
}

module.exports = checkBn;

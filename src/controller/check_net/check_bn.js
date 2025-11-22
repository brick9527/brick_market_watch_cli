const spotClient = require("../../util/binance_spot_client");

async function checkBn() {
  const response = await spotClient.restAPI.ping();

  return {
    status: response.status,
  }
}

module.exports = checkBn;

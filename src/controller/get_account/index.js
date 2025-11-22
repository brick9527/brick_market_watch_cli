const spotClient = require("../../util/binance_spot_client");

async function getAccount() {
  const response = await spotClient.restAPI.getAccount();
  // console.log(response.rateLimits);

  console.log(await response.data());
}

module.exports = getAccount;
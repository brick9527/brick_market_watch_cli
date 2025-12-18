async function getAccount(spotClient) {
  const { logger } = process.brickMarketWatchCli.ctx;

  const response = await spotClient.restAPI.getAccount();
  // logger.info(response.rateLimits);

  logger.info(await response.data());
}

module.exports = getAccount;
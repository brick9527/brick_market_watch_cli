async function checkBn(spotClient) {
  const response = await spotClient.restAPI.ping();
  // logger.debug(response);

  return {
    status: response.status,
  }
}

module.exports = checkBn;

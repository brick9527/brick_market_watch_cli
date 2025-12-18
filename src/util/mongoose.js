const mongoose = require('mongoose');

const logger = process.brickMarketWatchCli.ctx.logger;

/**
 * 连接mongodb，获取mongo客户端实例
 * @returns
 */
async function connectMongoDB(config) {
  const processName = process.env.process_name || process.pid;

  try {
    const {
      host,
      port,
      dbName,
      // authSource,
      user,
      password,
      // reconnectTries = 10,
      // reconnectInterval = 1000,
      // poolSize = 10,
      autoIndex = true,
    } = config;

    const client = await mongoose.connect(`mongodb://${host}:${port}`, {
      dbName,
      // authSource,
      user,
      pass: password,
      // autoReconnect: true,
      // reconnectTries,
      // reconnectInterval,
      // poolSize,
      autoIndex,
      // useNewUrlParser: true,
    });

    const { connection } = client;

    connection.on('disconnected', () => {
      logger.warn(`${processName} mongodb disconnected.`);
    });

    connection.on('error', err => {
      logger.error(`${processName} mongodb error.`, err);
    });

    connection.on('reconnected', () => {
      logger.info(`${processName} mongodb reconnected.`);
    });

    logger.info(`${processName} mongodb connected.`);

    // 加载models

    return client;
  } catch (err) {
    console.log(`${processName} mongodb failed.`, err);
  }
};

module.exports = connectMongoDB;
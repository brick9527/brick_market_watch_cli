const mongoose = require('mongoose');
const logger = require('./log4js').getLogger('mongoose');

/**
 * 连接mongodb，获取mongo客户端实例
 * @returns
 */
async function connectMongoDB(databaseConfig) {
  const processName = process.env.process_name || process.pid;
  const config = process.env.NODE_ENV === 'development' ? databaseConfig.dev : databaseConfig.prod;

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
      // authSource,
      dbName,
      user,
      pass: password, // 使用 password 替代 pass
      // autoReconnect: true,
      // reconnectTries,
      // reconnectInterval,
      // poolSize,
      autoIndex,
      // useNewUrlParser: true, // Mongoose 6+ 已默认启用
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
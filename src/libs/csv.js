const { AsyncParser } = require('@json2csv/node');
const { createWriteStream } = require('fs');

function writeJson2CsvFile({ jsonData, filePath, options = {} } = {}) {
  const { ctx } = process.brickMarketWatchCli;
  const { logger } = ctx;

  const writableStream = createWriteStream(filePath);

  const transformOpts = {};
  const asyncOpts = {};
  const parser = new AsyncParser(options, asyncOpts, transformOpts);

  parser.parse(jsonData).pipe(writableStream)
    .on('finish', () => {
      logger.info(`CSV file ${filePath} has been written successfully.`);
    });
}

module.exports = {
  writeJson2CsvFile,
};
#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const path = require('path');
const packageJson = require('./package.json');

const getKlineDataOptionsValidator = require('./src/validator/get_kline_data');


const program = new Command();

function _checkConfig(options) {
  if (!options?.file) {
    throw new Error ('需要指定配置文件. 详见 --help');
  }

  let configPath = path.join(process.cwd(), options.file);
  if (path.isAbsolute(options.file)) {
    configPath = options.file;
  }

  const config = require(configPath);

  return config;
}

program.name('bmwc')
  .description('a market watch cli tool')
  .version(packageJson.version);

// checknet
program.command('checknet')
  .description('检查网络状态')
  .action(() => {
    require('./bin/check_net')();
  });

// getaccount
program.command('getaccount')
  .description('获取账户信息')
  .action(() => {
    require('./bin/get_account')();
  });

// getprice
program.command('getprice')
  .description('获取当前价格')
  .action(() => {
    require('./bin/get_current_price')();
  });

// getnoticetarget
program.command('getnoticetarget')
  .description('获取告警目标')
  .option('--json', '以JSON格式输出')
  .action((options) => {
    require('./bin/get_notice_target')(options.json);
  });

// setnoticetarget
program.command('setnoticetarget')
  .description('设置告警目标')
  .requiredOption('-f, --file <path>', '指定配置文件')
  .action((options) => {
    const noticeTargetConfig = _checkConfig(options);
    require('./bin/set_notice_target')(noticeTargetConfig);
  });

// start
program.command('start')
  .description('启动监控')
  .action(() => {
    require('./bin/entrypoint')();
  });

// getklinedata
// node index.js getklinedata -s BTCUSDT -i 5m --startTime "2025-12-29 00:00:00" --endTime "2025-12-29 01:00:00" -o ./output
program.command('getklinedata')
  .description('获取k线数据')
  .requiredOption('-s, --symbolList <string>', '指定交易对列表，逗号分隔。如: BTCUSDT,ETHUSDT')
  .requiredOption('-i, --interval <string>', '指定k线时间间隔。如: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M')
  .requiredOption('--startTime <string>', '指定开始时间，格式：YYYY-MM-DD HH:mm:ss')
  .requiredOption('--endTime <string>', '指定结束时间，格式：YYYY-MM-DD HH:mm:ss')
  .requiredOption('-o, --outputFolder <string>', '指定输出文件夹路径')
  .action((options) => {

    const validationResult = getKlineDataOptionsValidator(options);
    if (!validationResult.isValid) {
      throw new Error(validationResult.errors.join('\n'));
    }

    require('./bin/get_kline_data')({
      symbolList: options.symbolList.split(','),
      interval: options.interval,
      startTime: options.startTime,
      endTime: options.endTime,
      outputFolder: options.outputFolder,
    });
  });

program.parse();

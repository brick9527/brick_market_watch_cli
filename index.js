#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const path = require('path');
const packageJson = require('./package.json');

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
  .action(() => {
    require('./bin/get_notice_target')();
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

program.parse();

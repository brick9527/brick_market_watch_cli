#!/usr/bin/env node
'use strict';
const meow = require('meow');
const path = require('path');

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

function main (inputCommand, options) {
  // getallorder
  if (inputCommand === 'checknet') {
    require('./bin/check_net')();
  }

  // getaccount
  if (inputCommand === 'getaccount') {
    require('./bin/get_account')();
  }

  // getprice
  if (inputCommand === 'getprice') {
    require('./bin/get_current_price')();
  }

  // version
  if (inputCommand === 'version') {
    const packageInfo = require('./package.json');
    console.log(`包名: ${packageInfo.name}\n版本: ${packageInfo.version}\n作者: ${packageInfo.author}\nhomepage: ${packageInfo.homepage}`);
  }
}

const cli = meow(`
	Usage
	  $ bmwc <input> <option>

  Input
    checknet      检查网络状态
    getaccount    获取账户信息
    getprice      获取当前的价格
    version       获取版本
    
	Options
	  --file, -f    指定配置文件

	Examples
	  $ bmwc getprice --file ./config.json
`, {
	flags: {
		file: {
			type: 'string',
			alias: 'f'
		}
	}
});
/*
{
	input: ['unicorns'],
	flags: {rainbow: true},
	...
}
*/

main(cli.input[0], cli.flags);
const path = require('path');
const log4js = require('log4js');

// 标准输出流的layout
const STDOUT_LAYOUT = {
  type: 'pattern',
  pattern: '%[[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p]%] %[%c%] %m',
};

// 写入到日志文件的layout
const FILE_LAYOUT = {
  type: 'pattern',
  pattern: '[%d{yyyy-MM-dd hh:mm:ss.SSS}] [%p] %c %m',
};

// 日志文件位置
const getLogFilePath = function (fileName, folderName = process.env.process_name || 'default') {
  return path.resolve(__dirname, '../../logs', folderName, fileName);
};

const logConfig = {
  appenders: {
    // 标准输出流追加器
    stdout: {
      type: 'stdout',
      layout: STDOUT_LAYOUT,
    },

    // server-debug级别日志
    debug: {
      type: 'dateFile',
      filename: getLogFilePath('debug'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
      layout: FILE_LAYOUT,
    },
    debugFilter: {
      type: 'logLevelFilter',
      appender: 'debug',
      level: 'debug',
      maxLevel: 'debug',
    },

    // server-info级别日志
    info: {
      type: 'dateFile',
      filename: getLogFilePath('info'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
      layout: FILE_LAYOUT,
    },
    infoFilter: {
      type: 'logLevelFilter',
      appender: 'info',
      level: 'info',
      maxLevel: 'info',
    },

    // server-warn级别日志
    warn: {
      type: 'dateFile',
      filename: getLogFilePath('warn'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
      layout: FILE_LAYOUT,
    },
    warnFilter: {
      type: 'logLevelFilter',
      appender: 'warn',
      level: 'warn',
      maxLevel: 'warn',
    },

    // server-error级别日志
    error: {
      type: 'dateFile',
      filename: getLogFilePath('error'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
      layout: FILE_LAYOUT,
    },
    errorFilter: {
      type: 'logLevelFilter',
      appender: 'error',
      level: 'error',
      maxLevel: 'fatal',
    },
  },

  categories: {
    default: {
      appenders: ['stdout', 'debugFilter', 'infoFilter', 'warnFilter', 'errorFilter'],
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    },
  },
};

log4js.configure(logConfig);

module.exports = log4js;
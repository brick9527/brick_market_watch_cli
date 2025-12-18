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

    // server-debug级别日志（log4js 6.x 的 dateFile 本身已经是异步的）
    debug: {
      type: 'dateFile',
      filename: getLogFilePath('debug'),
      pattern: 'yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
      layout: FILE_LAYOUT,
      // log4js 6.x 中，dateFile appender 默认使用异步写入
      // 以下是可选的性能优化配置
      encoding: 'utf-8', // 文件编码
      mode: 0o644, // 文件权限
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
  },

  categories: {
    default: {
      appenders: ['stdout', 'debug', 'info', 'warn', 'error'],
      level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    },
  },
};

log4js.configure(logConfig);

module.exports = log4js;
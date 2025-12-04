const path = require('path');

const { writeFile } = require('../util/file');

function saveNoticeConfig(noticeConfig) {
  const noticeConfigFilePath = path.join(__dirname, '../../');
  writeFile('notice_config.json', noticeConfigFilePath, JSON.stringify(noticeConfig, null, 2));
}

module.exports = saveNoticeConfig;
const _ = require('lodash');

function generateNoticeMsg({ noticeGroup, closeLocalTime }) {
  /**
   * noticeGroup = {
   *  BTCUSDT: {
   *    warningMsg: [],
   *    infoMsg: [],
   *  },
   * ...
   * }
   */
  let hasNoticeMsg = false;  // 标记是否存在需要发送的告警消息
  let msgContent = `<${closeLocalTime}>\n`;

  const noticeSymbolList = Object.keys(noticeGroup);

  // 遍历所有交易对的告警信息
  for (const symbolItem of noticeSymbolList) {
    // 跳过没有告警消息的交易对
    if (!noticeGroup[symbolItem]) {
      continue;
    }
    
    // 检查是否包含实际的告警消息（warning或info类型）
    if (_.get(noticeGroup, `${symbolItem}.warningMsg.length`, 0) === 0 && _.get(noticeGroup, `${symbolItem}.infoMsg.length`, 0) === 0) {
      continue;
    }
    hasNoticeMsg = true;
    msgContent += `# ${symbolItem}\n`;  // 添加交易对名称标题
    // 添加不同类型的告警消息（warningMsg、infoMsg等）
    for (const msgType of Object.keys(noticeGroup[symbolItem])) {
      msgContent += noticeGroup[symbolItem][msgType].join('\n');
    }
    msgContent += '\n--------------------------\n';  // 交易对之间的分隔线
  }

  return {
    hasNoticeMsg,
    msgContent,
  };
}

module.exports = generateNoticeMsg;
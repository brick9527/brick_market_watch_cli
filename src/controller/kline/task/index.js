const dayjs = require('dayjs');

const INTERVAL_MAPPING = {
  '1m': 60000,
  '3m': 180000,
  '5m': 300000,
  '15m': 900000,
  '30m': 1800000,
  '1h': 3600000,
  '2h': 7200000,
  '4h': 14400000,
  '6h': 21600000,
  '8h': 28800000,
  '12h': 43200000,
  '1d': 86400000,
  '3d': 259200000,
  '1w': 604800000,
};

async function seperateTask({ symbolList, interval, startTime, endTime }) {
  const taskList = [];

  const intervalMs = INTERVAL_MAPPING[interval];
  if (!intervalMs) {
    throw new Error(`不支持的interval：${interval}`);
  }

  // 判断startTime - endTime之间根据interval划分，是否超出1000个任务
  const totalIntervalCount = Math.ceil((dayjs(endTime).valueOf() - dayjs(startTime).valueOf()) / intervalMs);
  if (totalIntervalCount <= 1000) {
    // 1000以内，不用根据时间划分，直接根据symbolList进行拆分
    for (const symbol of symbolList) {
      taskList.push({
        symbol,
        startTime: dayjs(startTime).valueOf(),
        endTime: dayjs(endTime).valueOf(),
        interval,
      });
    }

    return taskList;
  }
  
  // 超出1000，算一算需要多少个1000才能放得下
  const taskGroupCount = Math.ceil(totalIntervalCount / 1000);
  for (let i = 0; i < taskGroupCount; i++) {
    const groupStartTime = dayjs(startTime).add(i * 1000 * intervalMs, 'ms').valueOf();
    const groupEndTime = dayjs(groupStartTime).add(999 * intervalMs, 'ms').valueOf();
    for (const symbol of symbolList) {
      taskList.push({
        symbol,
        startTime: groupStartTime,
        endTime: groupEndTime,
        interval,
      });
    }
  }

  // 还有最后一段，可能不到1000个任务
  const lastGroupStartTime = dayjs(startTime).add(taskGroupCount * 1000 * intervalMs, 'ms').valueOf();
  if (lastGroupStartTime < dayjs(endTime).valueOf()) {
    for (const symbol of symbolList) {
      taskList.push({
        symbol,
        startTime: lastGroupStartTime,
        endTime: dayjs(endTime).valueOf(),
        interval,
      });
    }
  }

  return taskList;
}

module.exports = seperateTask;
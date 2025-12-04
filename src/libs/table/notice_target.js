const Table = require('cli-table3');
const _ = require('lodash');

function generateNoticeTargetTable({ warning_target, info_target }) {
  const table = new Table({
    head: ['#', 'Symbol', 'Enable', 'Type', 'Price', 'Name', 'Desc'],
  });

  let counter = 1;

  const warningTargetSymbolList = Object.keys(warning_target);
  const infoTargetSymbolList = Object.keys(info_target);
  const uniqueSymbolList = _.union(warningTargetSymbolList, infoTargetSymbolList);

  for (const symbol of uniqueSymbolList) {
    const warningTargetList = _.get(warning_target, symbol, []);
    const infoTargetList = _.get(info_target, symbol, []);

    for (const warningItem of warningTargetList) {
      table.push([
        counter++,
        symbol,
        warningItem.enable ? '✅' : '❌',
        'warning',
        warningItem.price,
        warningItem.name,
        warningItem.desc,
      ]);
    }

    for (const infoItem of infoTargetList) {
      table.push([
        counter++,
        symbol,
        infoItem.enable ? '✅' : '❌',
        'info',
        infoItem.price,
        infoItem.name,
        infoItem.desc,
      ]);
    }
  }

  return table;
}

module.exports = generateNoticeTargetTable;
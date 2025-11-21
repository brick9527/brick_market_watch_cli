const fs = require('fs');
const path = require('path');

function readFile(filename, filepath = __dirname) {
  const fullFilepath = path.join(filepath, filename);

  const rawContent = fs.readFileSync(fullFilepath);

  return rawContent;
}

function writeFile(filename, filepath, content) {
  const fullFilepath = path.join(filepath, filename);

  fs.writeFileSync(fullFilepath, content, { flag: 'w', encoding: 'utf-8' });
}

module.exports = {
  readFile,
  writeFile,
};
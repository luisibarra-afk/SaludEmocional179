const fs = require('fs');
const path = require('path');

const dbPath = (name) => path.join(__dirname, 'data', `${name}.json`);

const read = (name) => {
  if (!fs.existsSync(dbPath(name))) return [];
  try {
    return JSON.parse(fs.readFileSync(dbPath(name), 'utf8'));
  } catch {
    return [];
  }
};

const write = (name, data) => {
  fs.writeFileSync(dbPath(name), JSON.stringify(data, null, 2));
};

module.exports = { read, write };

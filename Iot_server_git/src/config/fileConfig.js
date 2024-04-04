const path = require('path')
const defaultDir = {
  dir_name: path.join(__dirname,'..')
};
const homeDir = {
  dir_name : path.join(__dirname,'..','..','..','..')
}

module.exports = {
  defaultDir,
  homeDir
};


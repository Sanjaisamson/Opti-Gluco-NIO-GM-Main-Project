const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../databases/db");

const resultDataTable = sequelize.define("resultDataTable", {
  result_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_id: DataTypes.STRING,
  user_id: DataTypes.STRING,
  folder_path: DataTypes.STRING,
});
module.exports = { resultDataTable };

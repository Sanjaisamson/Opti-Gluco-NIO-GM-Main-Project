const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../databases/db");

const resultDataTable = sequelize.define("resultDataTable", {
  result_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_Id: DataTypes.STRING,
  product_code: DataTypes.STRING,
  user_id: DataTypes.STRING,
});
module.exports = { requestLogTable };

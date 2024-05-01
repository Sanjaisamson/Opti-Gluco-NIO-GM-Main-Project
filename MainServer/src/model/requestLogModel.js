const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../databases/db");

const requestLogTable = sequelize.define("requestLogTable", {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  request_code: DataTypes.STRING,
  product_code: DataTypes.STRING,
  user_id: DataTypes.INTEGER,
  job_id: DataTypes.STRING,
  job_status: DataTypes.STRING,
  final_result: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
});
// requestLogTable.sync({ alter: true });
module.exports = { requestLogTable };

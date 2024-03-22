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
  product_code: DataTypes.STRING,
  folder_path: DataTypes.STRING,
  refrence_value: DataTypes.STRING,
  result_value: DataTypes.STRING,
});
// sequelize.sync({ alter: true });
// console.log("table sync succefully completed");
module.exports = { resultDataTable };

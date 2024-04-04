const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../database/database");

const clientConfigTable = sequelize.define("clientConfigTable", {
  user_id: DataTypes.STRING,
  product_id: DataTypes.STRING,
  client_url: DataTypes.STRING,
});
// clientConfigTable.sync({ alter: true });
// console.log("table sync succefully completed");
module.exports = { clientConfigTable };

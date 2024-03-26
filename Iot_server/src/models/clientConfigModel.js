const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../database/database");

const clientConfigTable = sequelize.define("clientConfigTable", {
  product_id: DataTypes.STRING,
  client_url: DataTypes.STRING,
});
module.exports = { clientConfigTable };

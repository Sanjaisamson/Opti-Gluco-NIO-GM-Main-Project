const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../databases/db");

const tokenTable = sequelize.define("tokenTable", {
  user_id: DataTypes.INTEGER,
  refresh_token: DataTypes.STRING,
});
module.exports = { tokenTable };

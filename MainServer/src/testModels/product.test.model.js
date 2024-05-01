const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../databases/db");

const productTable = sequelize.define("productDetails", {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_code: DataTypes.STRING,
  user_id: DataTypes.INTEGER,
});

module.exports = {
  productTable,
};

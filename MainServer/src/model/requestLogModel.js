const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../databases/db");

const requestLogTable = sequelize.define("requestLogTable", {
  request_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_code: DataTypes.STRING,
  user_id: DataTypes.INTEGER,
  job_id: DataTypes.STRING,
  job_status: DataTypes.STRING,
});

requestLogTable
  .sync({ alter: true })
  .then(() => {
    console.log("requestLogTable synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing requestLogTable:", error);
  });

module.exports = { requestLogTable };

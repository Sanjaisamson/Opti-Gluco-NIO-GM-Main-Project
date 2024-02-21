const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../database/database");

const jobDataTable = sequelize.define("jobDataTable", {
  file_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  job_id: DataTypes.STRING,
  job_status: DataTypes.STRING,
  request_id: DataTypes.STRING,
  file_name: DataTypes.STRING,
});
jobDataTable
  .sync({ alter: true })
  .then(() => {
    console.log("jobDataTable synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing jobDataTable:", error);
  });

module.exports = { jobDataTable };

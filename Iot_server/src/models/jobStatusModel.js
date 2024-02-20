const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../database/database");

const jobStatusTable = sequelize.define("jobStatusTable", {
  job_number: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  job_id: DataTypes.STRING,
  job_status: DataTypes.STRING,
});
jobStatusTable
  .sync({ alter: true })
  .then(() => {
    console.log("jobStatusTable synchronized successfully.");
  })
  .catch((error) => {
    console.error("Error synchronizing jobStatusTable:", error);
  });

module.exports = { jobStatusTable };

const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../database/database");

const jobStatusTable = sequelize.define("jobStatusTable", {
  job_number: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  job_id: DataTypes.STRING,
  job_status: DataTypes.STRING,
  request_id: DataTypes.STRING,
});

module.exports = { jobStatusTable };

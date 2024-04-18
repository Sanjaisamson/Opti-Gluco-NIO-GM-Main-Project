const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../databases/db");

const patientDataTable = sequelize.define("patientData", {
  user_id: DataTypes.INTEGER,
  //   product_code: DataTypes.STRING,
  A1c_value: DataTypes.STRING,
  fasting_status: DataTypes.STRING,
  last_food_time: DataTypes.STRING,
  family_health_data: DataTypes.STRING,
  blood_pressure: DataTypes.STRING,
});

patientDataTable.sync({ alter: true });

module.exports = {
  patientDataTable,
};

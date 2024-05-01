const { Sequelize, DataTypes } = require("sequelize");

const { sequelize } = require("../databases/db");

const patientDataTable = sequelize.define("patientData", {
  user_id: DataTypes.INTEGER,
  //   product_code: DataTypes.STRING,
  hypertension_status: DataTypes.STRING,
  heartdisease_status: DataTypes.STRING,
  smoking_status: DataTypes.STRING,
  height: DataTypes.STRING,
  weight: DataTypes.STRING,
  HbA1c: DataTypes.STRING,
  BMI_Value: DataTypes.STRING,
  last_sugar_level: DataTypes.STRING,
});

patientDataTable.sync({ alter: true });

module.exports = {
  patientDataTable,
};

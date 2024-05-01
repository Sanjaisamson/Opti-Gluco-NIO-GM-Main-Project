const Sequelize = require("sequelize");

const sequelize = new Sequelize("opti_gluco_database", "postgres", "1234", {
  host: "localhost",
  port: "5432",
  dialect: "postgres",
  synchronize: true,
  logging: false,
});

const dbConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
module.exports = { dbConnect, sequelize };

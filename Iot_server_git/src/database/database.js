const Sequelize = require("sequelize");
const sequelize = new Sequelize("opti_gluco_device_DB", "", "", {
  host: "./dev.sqlite",
  dialect: "sqlite",
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

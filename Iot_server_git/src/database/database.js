const Sequelize = require("sequelize");
const sequelize = new Sequelize("opti_gluco_device_DB", "", "", {
  host: "./dev.sqlite",
  dialect: "sqlite",
  synchronize: true,
  logging: false,
});

const dbConnect = () => {
  return sequelize
    .authenticate()
    .then(() => {
      console.log("Connection has been established successfully.");
    })
    .catch((err) => {
      console.error("Unable to connect to the database:", err);
    });
};
module.exports = { dbConnect, sequelize };

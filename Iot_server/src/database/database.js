const Sequelize = require("sequelize");
const sequelize = new Sequelize("opti_gluco_device_DB", "", "", {
  host: "./dev.sqlite",
  dialect: "sqlite",
  synchronize: true,
  logging: false,
  pool: {
    max: 5, // Adjust max pool size as needed
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
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

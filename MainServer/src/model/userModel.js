const { Sequelize, DataTypes } = require('sequelize');

const {sequelize} = require("../databases/db");

const userTable = sequelize.define("userTable", {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_name: DataTypes.STRING,
      user_mail: DataTypes.STRING,
      user_password: DataTypes.STRING
});
userTable.sync({ alter: true })
    .then(() => {
        console.log('userTable synchronized successfully.');
    })
    .catch(error => {
        console.error('Error synchronizing userTable:', error);
    });

module.exports = { userTable };

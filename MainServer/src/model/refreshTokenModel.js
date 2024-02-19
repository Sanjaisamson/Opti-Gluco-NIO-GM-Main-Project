const { Sequelize, DataTypes } = require('sequelize');

const {sequelize} = require("../databases/db");

const tokenTable = sequelize.define("tokenTable", {
      user_id: DataTypes.INTEGER,
      refresh_token: DataTypes.STRING,
});
tokenTable.sync({ alter: true })
    .then(() => {
        console.log('TokenTable synchronized successfully.');
    })
    .catch(error => {
        console.error('Error synchronizing tokenTable:', error);
    });

module.exports = { tokenTable };

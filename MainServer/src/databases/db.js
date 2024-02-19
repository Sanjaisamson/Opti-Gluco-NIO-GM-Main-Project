const Sequelize = require('sequelize');
const sequelize = new Sequelize('opti_gluco_database', 'postgres', '1234', {
  host: 'localhost',
  port : '5432',
  dialect: 'postgres',
  synchronize:true
}); 

const dbConnect = () => {
    return sequelize.authenticate()
      .then(() => {
        console.log('Connection has been established successfully.');
      })
      .catch((err) => {
        console.error('Unable to connect to the database:', err);
      });
  };
module.exports = {dbConnect, sequelize};
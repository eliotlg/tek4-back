const Sequelize = require('sequelize');

const dbcongfig = new Sequelize('sequelize', null, null, {
  host: 'localhost',
  dialect: 'sqlite',
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  // SQLite only
  storage: 'db/database.sqlite',

  logging: false
});

module.exports.dbcongfig = dbcongfig;

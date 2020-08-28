const Sequelize = require('sequelize');
const db = require('../controllers/sequelize').dbcongfig;

const mLogin = db.define('Login', {
  id: {
    autoIncrement: true,
    primaryKey: true,
    type: Sequelize.INTEGER
  },
  loginCookie: Sequelize.TEXT,
  validationHash: Sequelize.TEXT,
  validated: Sequelize.BOOLEAN,
  forgotHash: Sequelize.TEXT,
  email: Sequelize.TEXT,
  passwordHash: Sequelize.TEXT,
  admin: Sequelize.BOOLEAN
});

module.exports = mLogin;
const mLogin = require('../models/mLogin');
const request = require("request");
const moment = require("moment");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const nodemailer = require("nodemailer");
var randomstring = require("randomstring");
const argon2 = require('argon2');

class Login {

  async create(body) {
    try {
      console.log(body);
      if (body.email.endsWith("@epitech.eu") == false) // Vérifier si c'est une addresse epitech
        return ({success: false, error: "This must be a epitech email address"})
      let exists = await mLogin.findOne({
        where: {
          email: body.email
        }
      });
      if (exists != null) // Vérifier si il n'y a pas déjà un compte sur la même addresse
        return ({success: false, error: "Account already exists"});
      const passwordHash = await argon2.hash(body.password);
      const emailHash = await argon2.hash(body.email);
      const login = await mLogin.create({
        loginCookie: "",
        validationHash: emailHash,
        validated: false,
        forgotHash: "",
        email: body.email,
        passwordHash: passwordHash
      });
      /*
       -------------------
       ENVOI DU MAIL DE VERIF
       -------------------
      */
      return ({success: true});
    } catch (err) {
      console.error(err);
      return ({success: false, error: err});
    }
  }

  async login(body) {
    try {
      console.log(body);
      let login = await mLogin.findOne({
        where: {
          email: body.email
        }
      });
      if (login == null)
        return ({success: false, error: "Email does not match"});
      if (await argon2.verify(login.passwordHash, body.password)) {
        if (login.loginCookie == "") {
          login.loginCookie = await argon2.hash(body.email + body.password + new Date().toDateString());
          await login.save({ fields: ['loginCookie'] });
        }
        return ({success: true, cookie: login.loginCookie});
      } else
        return ({success: false, error: "Password does not match"});
    } catch (err) {
      console.error(err);
      return ({success: false, error: err});
    }
  }

}

module.exports = Login;
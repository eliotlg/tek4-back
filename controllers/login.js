const mLogin = require('../models/mLogin');
const request = require("request");
const moment = require("moment");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const nodemailer = require("nodemailer");
var randomstring = require("randomstring");
const argon2 = require('argon2');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

class Login {

  /*
  ** @params email
  ** @params password
  */
  async create(body) {
    try {
      if (body.password == null || body.password.length < 6 || body.email == null || body.email.endsWith("@epitech.eu") == false)
        return ({success: false, error: "Bad parameters"});
      let exists = await mLogin.findOne({
        where: {
          email: body.email
        }
      });
      if (exists != null) // Vérifier si il n'y a pas déjà un compte sur la même addresse
        return ({success: false, error: "Account already exists"});
      const passwordHash = await argon2.hash(body.password);
      const emailHash = uuidv4();
      const login = await mLogin.create({
        loginCookie: "",
        validationHash: emailHash,
        validated: false,
        forgotHash: "",
        email: body.email,
        passwordHash: passwordHash
      });
      let testAccount = await nodemailer.createTestAccount();
      let transporter = nodemailer.createTransport({ // Envoie du mail de verif
        service: 'gmail',
        port: 25,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "noreply.rednight@gmail.com", // generated ethereal user
          pass: process.env.MAILER_PASSWORD // generated ethereal password
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      let emailText = `Lien de confirmation : ${process.env.BACK}/account/validate/${emailHash}`;
      let emailHtml = `<a href="${process.env.BACK}/account/validate/${emailHash}" style="font-size: 26px">Lien de confirmation</a>`;
      let info = await transporter.sendMail({
        from: `noreply rednight <noreply.rednight@gmail.com>`,
        replyTo: `noreply.rednight@gmail.com`,
        to: `${body.email}`, // list of receivers
        subject: `[Forum Tek4] Lien de validation`, // Subject line
        text: `${emailText}`, // plain text body
        html: `${emailHtml}` // html body
      }, (error, info) => {
        if (error) {
          console.error(error);
          return ({ success: false, error: err});
        }
        console.log(info);
      });
      return ({success: true});
    } catch (err) {
      console.error(err);
      return ({success: false, error: err});
    }
  }

  /*
  ** @params email
  ** @params password
  */
  async login(body) {
    try {
      if (body.password == null || body.password.length < 6 || body.email == null || body.email.endsWith("@epitech.eu") == false)
        return ({success: false, error: "Bad parameters"});
      let login = await mLogin.findOne({
        where: {
          email: body.email
        }
      });
      if (login == null)
        return ({success: false, error: "Email does not match"});
      if (await argon2.verify(login.passwordHash, body.password)) {
        if (login.loginCookie == "" || login.loginCookie == null) {
          login.loginCookie = await argon2.hash(body.email + body.password + new Date().toDateString()); // Cookie de connexion
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

  /*
  ** @params id
  */
  async validate(params) {
    try {
      if (params.id == null || params.id == "")
        return ({success: false, error: "Bad parameters"});
      let id = params.id;
      console.log(id.length);
      let login = await mLogin.findOne({
        where: {
          validationHash: id
        }
      });
      if (login == null)
        return ("Error: Validation link not found");
      else {
        login.validated = true;
        login.validationHash = null;
        await login.save({ fields: ['validated', 'validationHash'] });
        return ("Account validated");
      }
    } catch (err) {
      console.error(err);
      return ({success: false, error: err});
    }
  }

  /*
  ** @params email
  */
  async forgotPassword(body) {
    try {
      if (body.email == null || body.email.endsWith("@epitech.eu") == false)
        return ({success: false, error: "Bad parameters"});
      let login = await mLogin.findOne({
        where: {
          email: body.email
        }
      });
      if (login == null)
        return ({success: false, error: "Couldn't find a matching email address"});
      else {
        login.forgotHash = uuidv4();
        await login.save({ fields: ['forgotHash']});
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({ // Envoie du mail de changement mdp
          service: 'gmail',
          port: 25,
          secure: false, // true for 465, false for other ports
          auth: {
            user: "noreply.rednight@gmail.com", // generated ethereal user
            pass: process.env.MAILER_PASSWORD // generated ethereal password
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        let emailText = `Lien de changement de mot de passe : ${process.env.FRONT}/account/forgot/${login.forgotHash}`;
        let emailHtml = `<a href="${process.env.FRONT}/account/forgot/${login.forgotHash}" style="font-size: 26px">Lien de changement de mot de passe</a>`;
        let info = await transporter.sendMail({
          from: `noreply rednight <noreply.rednight@gmail.com>`,
          replyTo: `noreply.rednight@gmail.com`,
          to: `${body.email}`, // list of receivers
          subject: `[Forum Tek4] Lien de changement de mot de passe`, // Subject line
          text: `${emailText}`, // plain text body
          html: `${emailHtml}` // html body
        }, (error, info) => {
          if (error) {
            console.error(error);
            return ({ success: false, error: err});
          }
          console.log(info);
        });
        return ({success: true});
      }
    } catch (err) {
      console.error(err);
      return ({success: false, error: err});
    }
  }

  /*
  ** @params password
  ** @params forgotHash
  */
  async newPassword(body) {
    try {
      if (body.password == null || body.password.length < 6 || body.forgotHash == null || body.forgotHash == "")
        return ({success: false, error: "Bad parameters"});
      let hash = body.forgotHash;
      let login = await mLogin.findOne({
        where: {
          forgotHash: hash
        }
      });
      if (login == null)
        return ({success: false, error: "Couldn't find a matching account"});
      else {
        login.forgotHash = null;
        login.passwordHash = await argon2.hash(body.password);
        await login.save({ fields: ['forgotHash', 'passwordHash'] });
        return ({success: true});
      }
    } catch (err) {
      console.error(err);
      return ({success: false, error: err});
    }
  }

}

module.exports = Login;
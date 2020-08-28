const express = require('express');
const router = express.Router();
const Login = require('../../controllers/login');
const multer = require('multer');
var randomstring = require("randomstring");
var path = require('path');
var cors = require('cors');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        console.log(file);
        cb(null, randomstring.generate(9) + new Date().getMilliseconds() + path.extname(file.originalname));
    }
});
const upload = multer({storage: storage});


var corsOptions = {
    origin: '*'
}

router.post("/account/create", cors(corsOptions), async(req, res) => {
    const l = new Login();
    try {
        const value = await l.create(req.body);
        res.json(value);
    } catch (err) {
        console.error("error: ", err);
        res.json(err);
    }
});

router.post("/account/login", cors(corsOptions), async(req, res) => {
    const l = new Login();
    try {
        const value = await l.login(req.body);
        res.json(value);
    } catch (err) {
        console.error("error: ", err);
        res.json(err);
    }
});

router.get("/account/validate/:id", cors(corsOptions), async(req, res) => {
    const l = new Login();
    try {
        const value = await l.validate(req.params);
        res.json(value);
    } catch (err) {
        console.error("error: ", err);
        res.json(err);
    }
});

router.post("/account/forgot", cors(corsOptions), async(req, res) => {
    const l = new Login();
    try {
        const value = await l.forgotPassword(req.body);
        res.json(value);
    } catch (err) {
        console.error("error: ", err);
        res.json(err);
    }
});

router.post("/account/newPassword", cors(corsOptions), async(req, res) => {
    const l = new Login();
    try {
        const value = await l.newPassword(req.body);
        res.json(value);
    } catch (err) {
        console.error("error: ", err);
        res.json(err);
    }
});

router.post("/account/isLoggedIn", cors(corsOptions), async(req, res) => {
    const l = new Login();
    try {
        const value = await l.isLoggedIn(req.body);
        res.json(value);
    } catch (err) {
        console.error("error: ", err);
        res.json(err);
    }
});

module.exports = router;
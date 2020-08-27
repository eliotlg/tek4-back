require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./controllers/sequelize').dbcongfig;
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const cors = require('cors');
var CronJob = require('cron').CronJob;

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.use(cors());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

console.log("running on port: ", port);

app.use(require('./routes/opened/routes.js'));
app.use('/uploads', express.static('uploads'));

// Handle 404
app.use(function (req, res) {
    res.status(404).send('404: Page not Found!');
});

// Handle 500
app.use(function (error, req, res, next) {
    res.status(500).send('500: Internal Server Error');
});

app.listen(port, async () => {
    console.log(`Server listening on: ${port}.`);
    try {
        await db.authenticate();
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});

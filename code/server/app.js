const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const sessionPool = require('pg').Pool;
const dotenv = require('dotenv');

const app = express();

const options = {
    "origin": "http://localhost:3000",
    "method": ["GET", "POST", "DELETE", "UPDATE"],
    "credentials": true
};

app.use(express.json());
app.use(cors(options));
const PORT = 4000;

const databasePool = new sessionPool({
    user: process.env.USER,
    host: process.env.HOST,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.PORT
});

app.get('/test', (req, res) => {
    res.json({
        test: "hello"
    });
});

app.listen(PORT, ()  => {
    console.log("server is running on ", PORT);
})
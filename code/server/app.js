const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const sessionPool = require('pg').Pool;
const dotenv = require('dotenv');
dotenv.config();

const app = express();

const options = {
    "origin": "http://localhost:3000",
    "method": ["GET", "POST", "DELETE", "UPDATE"],
    "credentials": true
};

app.use(express.json());
app.use(cors(options));
const PORT = 4000;

console.log(process.env.PASSWORD);

const databasePool = new sessionPool({
    user: process.env.USER,
    host: process.env.HOST,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: 5432
});

app.get('/test', async (req, res) => {
    let client;
    try{
        client = await databasePool.connect();
        const result = await client.query('SELECT * FROM test;');
        res.json({
            response: result.rows[0].name
        });
    } catch(err) {
        console.log(err.message);
    } finally {
        client.release();
    }
});

app.post('/post', async (req, res) => {
    try {
        if(req.body['title'] && req.body['post']){
            //let body = await JSON.parse(req.body);
            console.log(req.body.title, req.body.post);
            res.send(200);
        } else {
            res.status(400).send('Malformed request');
        }

    } catch(e){
        console.log(e.message);
    } finally {

    }
});                                 

app.listen(PORT, ()  => {
    console.log("server is running on ", PORT);
})
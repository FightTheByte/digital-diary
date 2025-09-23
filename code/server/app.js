const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const sessionPool = require('pg').Pool;
const dotenv = require('dotenv');
const pgSession = require('connect-pg-simple')(session);
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

const sessionConfig = {
    store: new pgSession({
        pool: databasePool,
        tableName: 'session',
        createTableIfMissing: true
    }),
    name: 'SID',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 100,
      secure: false,
      sameSite: "none",
      httpOnly: true
    }
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());


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
    let client;
    let query;
    let tags;
    let body;
    let title;
    let array_index = 0;
    let user_id = 'edef587d-f738-4d72-90ca-9e307192d651';

    try {
        if(req.body['title'] && req.body['post']){
            client = await databasePool.connect();
            body = req.body['post'];
            title = req.body['title'];
            if(req.body['tags']){
                query = 'INSERT INTO posts (title, body, users_id, tags) VALUES ($1, $2, $3, $4);';
                tags = req.body.tags;
            } else {
                query = 'INSERT INTO posts (title, body, users_id) VALUES ($1, $2, $3);';
                array_index++;
            }
        } else {
            res.status(400).send('Malformed request');
        }

        const argument_array = [[title, body, user_id, tags], [title, body, user_id]]
        const response = await client.query(
            query,
            argument_array[array_index]
        );

        res.send(200);
    } catch(e){
        res.status(500).send(e);
    } finally {
        client.release();
    }
});                                 

app.listen(PORT, ()  => {
    console.log("server is running on ", PORT);
})
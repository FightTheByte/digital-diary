const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const sessionPool = require('pg').Pool;
const dotenv = require('dotenv');
const LocalStrategy = require('passport-local').Strategy;
const pgSession = require('connect-pg-simple')(session);
dotenv.config();

const app = express();

const options = {
    "origin": "http://localhost:3000",
    "methods": ["GET", "POST", "DELETE", "PUT"],
    credentials: true
};

app.use(express.json());
app.use(cors(options));
const PORT = 4000;



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
      sameSite: "lax",
      httpOnly: true
    }
}

app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

async function findByUsername(username, callback){
    let client;
    try{
        client = await databasePool.connect();
        const response = await client.query(
            'SELECT * FROM users WHERE username = $1;',
            [username]
        );
        callback(null, response.rows[0])

    } catch(e) {
        callback(e);
    } finally {
        client.release();
    }
}

async function findById(id, callback){
    let client;
    try{
        client = await databasePool.connect();
        const response = await client.query(
            'SELECT * FROM users WHERE id = $1;',
            [id]
        );
        callback(null, response.rows[0]);
    } catch(e){
        callback(e.message);
    } finally {
        client.release();
    }
}

passport.use( new LocalStrategy(
    function(username, password, done){
        findByUsername(username, async (err, user) => {
            if(err) return done(err);

            if(!user) return done(null, false);

            if(await bcrypt.compare(password, user.password)){
                return done(null, user);
            }

            return done(null, false);
        })
    }
))


passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    findById(id, (err, user) => {
        if(err) return done(err);
        done(null, user);
    });
})

app.get('/authenticated', (req, res) => {
    if(req.isAuthenticated()){
        res.send(true);
    } else {
        res.send(false);
    }
})

app.post('/register', async (req, res) =>{
    let client, username, password;
    if(req.body['username'] && req.body['password']){
        username = req.body.username;
        password = req.body.password;
        console.log(req.body, username, password)
        if(username.length > 60){
            return res.status(400).send('username character length exceeded 60');
        }
        if(password.length > 255){
            return res.status(400).send('password character length exceeded 255');
        }
    } else {
        return res.status(400).send('Missing username or password');
    }
    try{
        client = await databasePool.connect();

        const duplicate_check = await client.query(
            'SELECT username FROM users WHERE username = $1;',
            [username]
        )
        if(duplicate_check.rows.length > 0) return res.status(400).send('Username already exists');

        password = await bcrypt.hash(password, 10);

        await client.query('BEGIN');
        const response = client.query(
            'INSERT INTO users (username, password) VALUES ($1, $2);',
            [username, password]
        );
        client.query('COMMIT');
        res.send('success');
    } catch(e) {
        client.query('ROLLBACK');
        res.status(500).send('Unknown Server Error');
    } finally{
        client.release();
    }

})

app.post('/login',
  passport.authenticate('local', {failureMessage: true }),
  function(req, res) {
    res.send('Logged in'); 
  }
);

app.get('/logout', (req, res, next) => {
    if(!req.isAuthenticated()) return res.status(403).send('Unauthorised');
    req.logout((err) => {
        if(err) return next(err);
        res.send('Logged out');
    })
  }
);

app.get('/test', async (req, res) => {
    res.send(req.user);
});

app.post('/post', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(403).send('Unauthorised');
    let client;
    let query;
    let tags;
    let body;
    let title;
    let array_index = 0;
    let user_id = req.user.id
    try {
        if(req.body['title'] && req.body['post']){
            client = await databasePool.connect();
            body = req.body['post'];
            title = req.body['title'];
            if(body.length > 2000) return res.status(400).send('journal entry more than 2000 characters');
            if(title.length > 255) return res.status(400).send('journal title more than 255 characters');
            if(req.body['tags']){
                if(req.body['tags'].length > 10) return res.status(400).send('More than 10 tags');
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
        res.status(500).send(e.message);
    } finally {
        client.release();
    }
}); 

app.get('/get-posts', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(403).send('Unauthorised');
    let client;
    const user_id = req.user.id;
    const query = 'SELECT title, id, date, tags, body FROM posts WHERE users_id = $1 ORDER BY date DESC;'
    try{
        client = await databasePool.connect(); 
        const response = await client.query(
            query,
            [user_id]
        )
        res.json({
            response: response.rows 
        })
    } catch(e) {
        res.status(500).send('Unknown server error');
    } finally {
        client.release();
    }
})

app.get('/get-post', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(403).send('Unauthorised');
    let client;
    const user_id = req.user.id;
    let {id} = req.body;
    id = parseInt(id);
    const query = 'SELECT title, id, body, date FROM posts WHERE users_id = $1 AND id = $2;'
    
    if(!(id < 0 || id > 0)) return res.status(400).send('incorrect id parameter');
    
    try{
        client = await databasePool.connect(); 
        const response = await client.query(
            query,
            [user_id, id]
        )
        res.json({
            response: response.rows[0] 
        })
    } catch(e) {
        res.status(500).send('Unknown server error');
    } finally { 
        client.release();
    }
})

app.delete('/delete-post', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(403).send('Unauthorised');
    let client;
    const user_id = req.user.id;
    let {id} = req.body;
    id = parseInt(id);
    const query = 'DELETE FROM posts WHERE id = $1 AND users_id = $2;';
    
    if(!(id < 0 || id > 0)) return res.status(400).send('incorrect id parameter');

    try{
        client = await databasePool.connect();
        const response = await client.query(
            query,
            [id, user_id]
        )
        res.status(204).send('Deletion successful');
    } catch(e) {
        res.status(500);
    } finally {
        client.release();
    }
})

app.put('/update-post', async (req, res) => {
    if(!req.isAuthenticated()) return res.status(403).send('Unauthorised');
    let client, title, body, query;
    const user_id = req.user.id;
    let {id} = req.body;
    let param_array;
    id = parseInt(id);
 
    if(!(id < 0 || id > 0)) return res.status(400).send('incorrect id parameter');
    if(req.body['title'] && req.body['body']){
        query = 'UPDATE posts SET title = $1, body = $2 WHERE users_id = $3 AND id = $4;';
        title = req.body['title'];
        body = req.body['body'];
        param_array = [title, body, user_id, id];
    } else {
        if(!(req.body['title'] || req.body['body'])) return res.status(400).send('Missing both title and body');
        req.body['title']
        ?(() => {
            query = 'UPDATE posts SET title = $1 WHERE users_id = $2 AND id = $3;'
            title = req.body['title']
            param_array = [title, user_id, id];
        })()
        :(() => {
            query = 'UPDATE posts SET body = $1 WHERE users_id = $2 AND id = $3;';
            body = req.body['body'];
            param_array = [body, user_id, id];
        })()
    }

    try{
        client = await databasePool.connect();
        const response = await client.query(
            query,
            param_array
        )
        res.status(200).send('Update successful');
    } catch(e) {
        res.status(500);
    } finally {
        client.release();
    }
})


app.listen(PORT, ()  => {
    console.log("server is running on ", PORT);
})
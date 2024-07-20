const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require("mysql");
const cors =  require('cors');
const bcrypt = require('bcrypt');

const app = express()
app.use(express.json())
app.use(cors())
app.use(bodyParser.json());


app.use(session({
    secret: 'sessionKey', // Change this to a secure random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS
}));


const db = mysql.createConnection({
    host: "localhost",
    user:"root",
    password:"root",
    database:"userlists",
    port: "8889"
})

app.post('/login', async (req, res) => {
    const { email, pw } = req.body;

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error fetching user');
        }

        if (results.length > 0) {
            const user = results[0];
            const match = await bcrypt.compare(pw, user.password);

            if (match) {
                req.session.userId = user.id; // Store userId in session
                res.status(200).send(user);
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});



app.put('/update-user', (req, res) => {
    const { id, fname, email } = req.body; // Assume user id is part of the request body
    console.log( req.body);
    const sql = 'UPDATE users SET fname = ?, email = ? WHERE id = ?';
    db.query(sql, [fname, email, id], (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.status(500).send('An error occurred while updating the profile.');
        }
        console.log(result);
        return res.send('Profile updated successfully.');
    });
});

app.post('/logout', (req, res) => {
    // Perform any cleanup tasks, such as invalidating the session
    // For example, destroy the session or delete the session data from the database
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        // Session destroyed successfully
        res.status(200).send('Logged out successfully');
    });
});

app.delete('/delete/:id', (req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM users WHERE id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) return res.status(500).send('Error deleting user');
        req.session.destroy();
        res.status(200).send('User deleted successfully');
    });
});

app.post('/signup', async (req, res) => {
    const { fname, lname, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'INSERT INTO users (fname, lname, email, password) VALUES (?, ?, ?, ?)';
    db.query(query, [fname, lname, email, hashedPassword], (err, result) => {
        if (err) {
            console.error('Error creating user:', err);
            return res.status(500).send('Error creating user');
        }
        res.status(201).send('User created successfully');
    });
});

app.get('/listing', (req, res) => {
    db.query('SELECT * FROM property', (err, results) => {
        if (err) {
            console.error('Error fetching properties:', err);
            res.status(500).send('Server error');
            return;
        }
        res.json(results);
    });
});



app.listen(8000,()=>{
    console.log("Listening");
})






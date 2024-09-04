const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require("mysql");
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer'); // For file uploads
const csv = require('csv-parser'); // For parsing CSV files
const fs = require('fs'); // For file system operations

const corsOptions = {
    origin: 'http://localhost:5173', // Update to match your frontend's URL
    credentials: true,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use(session({
    secret: 'sessionKey', // Change this to a secure random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure: true if using HTTPS
}));

const db = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "root",
    database: "userlists",
    port: "8889"
});

// Function to fetch existing properties from the database
const fetchExistingProperties = (callback) => {
    const query = 'SELECT propertyId FROM properties'; // Adjust with relevant columns
    db.query(query, (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

  
app.post('/import-csv', (req, res) => {
    const properties = req.body; // JSON data from the frontend

    // Log the received data to check its structure
    console.log('Received data:', properties);

    // Step 1: Extract property IDs (or other unique fields) to check for duplicates
    const uniqueFields = properties.map(item => item['순번']); // or use another unique field

    // Step 2: Query the database to find existing properties with the same unique fields
    const query = `SELECT 순번 FROM property WHERE 순번 IN (?)`;

    db.query(query, [uniqueFields], (err, results) => {
        if (err) {
            console.error('Error fetching existing properties:', err);
            return res.status(500).send('Error checking existing data');
        }

        // Step 3: Filter out duplicates based on the results from the database
        const existingFields = results.map(row => row['순번']); // Or map based on the unique field
        const filteredProperties = properties.filter(item => !existingFields.includes(item['순번']));

        if (filteredProperties.length === 0) {
            // If no new data, send a message
            return res.status(200).send('No new data to insert (all duplicates).');
        }

        // Step 4: Prepare data for bulk insertion
        const values = filteredProperties.map(item => [
            item['순번'], 
            item['등록일자'], 
            item['부동산구분'], 
            item['거래방식'], 
            item['거래완료여부'], 
            item['거래완료일자'], 
            item['담당자'], 
            item['구'], 
            item['읍면동'], 
            item['구상세주소'], 
            item['도로명'], 
            item['신상세주소'], 
            item['건물명'], 
            item['동'], 
            item['호수'], 
            item['보증금'], 
            item['월세'], 
            item['관리비'], 
            item['전체m2'], 
            item['전용m2'], 
            item['전체평'], 
            item['전용평'], 
            item['EV유무'], 
            item['화장실개수'], 
            item['주차가능대수'], 
            item['비밀번호'], 
            item['이름'], 
            item['휴대폰번호'], 
            item['기타특이사항'], 
            item['총수수료'], 
            item['소장'], 
            item['직원']
        ]);

        // Step 5: Insert the non-duplicate data into the database
        const sql = `INSERT INTO property (순번, 등록일자, 부동산구분, 거래방식, 거래완료여부, 거래완료일자, 담당자, 구, 읍면동, 구상세주소, 도로명, 신상세주소, 건물명, 동, 호수, 보증금, 월세, 관리비, 전체m2, 전용m2, 전체평, 전용평, EV유무, 화장실개수, 주차가능대수, 비밀번호, 이름, 휴대폰번호, 기타특이사항, 총수수료, 소장, 직원) VALUES ?`;

        db.query(sql, [values], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).send('Error inserting data');
            }
            res.status(200).send(`${filteredProperties.length} new records inserted successfully`);
        });
    });
});



app.post('/login', async (req, res) => {
    try {
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
                    req.session.userId = user.id;
                    res.status(200).send(user);
                } else {
                    res.status(401).send('Invalid credentials');
                }
            } else {
                res.status(401).send('Invalid credentials');
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).send('Server error');
    }
});

app.put('/update-user', (req, res) => {
    const { id, fname, email } = req.body; // Assume user id is part of the request body
    console.log(req.body);
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
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
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

// Authentication check endpoint
app.get('/auth/check', (req, res) => {
    if (req.session.userId) {
        res.status(200).json({ loggedIn: true, userId: req.session.userId });
    } else {
        res.status(401).json({ loggedIn: false });
    }
});

app.listen(8000, () => {
    console.log("Listening on port 8000");
});

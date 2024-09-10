require('dotenv').config();
const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require("mysql");
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
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
    secret: process.env.SESSION_SECRET, // Use environment variable for session secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure: true if using HTTPS
}));

const db = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


// Function to fetch existing properties from the database
const fetchExistingProperties = (callback) => {
    const query = 'SELECT propertyId FROM properties'; // Adjust with relevant columns
    db.query(query, (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

// Import CSV
app.post('/import-csv', (req, res) => {
    const properties = req.body; // JSON data from the frontend

    const uniqueFields = properties.map(item => item['순번']); // or use another unique field

    const query = `SELECT 순번 FROM property WHERE 순번 IN (?)`;

    db.query(query, [uniqueFields], (err, results) => {
        if (err) {
            console.error('Error fetching existing properties:', err);
            return res.status(500).send('Error checking existing data');
        }

        const existingFields = results.map(row => row['순번']);
        const filteredProperties = properties.filter(item => !existingFields.includes(item['순번']));

        if (filteredProperties.length === 0) {
            return res.status(200).send('No new data to insert (all duplicates).');
        }

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
            item['직원'],
            item['메모'],
            item['img_path'],
        ]);

        const sql = `INSERT INTO property (순번, 등록일자, 부동산구분, 거래방식, 거래완료여부, 거래완료일자, 담당자, 구, 읍면동, 구상세주소, 도로명, 신상세주소, 건물명, 동, 호수, 보증금, 월세, 관리비, 전체m2, 전용m2, 전체평, 전용평, EV유무, 화장실개수, 주차가능대수, 비밀번호, 이름, 휴대폰번호, 기타특이사항, 총수수료, 소장, 직원, 메모, img_path) VALUES ?`;

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
    const sql = 'UPDATE users SET fname = ?, email = ? WHERE id = ?';
    db.query(sql, [fname, email, id], (err, result) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.status(500).send('An error occurred while updating the profile.');
        }
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

const util = require('util');

// Promisify the db.query method
const query = util.promisify(db.query).bind(db);

app.put('/update-property/:propertyId', async (req, res) => {
    const propertyId = req.params.propertyId;
    const updatedFields = req.body;
    if (!propertyId) {
        return res.status(400).send('Property ID is required.');
    }

    const setClause = Object.keys(updatedFields)
        .map(key => `${key} = ?`)
        .join(', ');

    const sql = `UPDATE property SET ${setClause} WHERE 순번 = ?`;

    const values = [...Object.values(updatedFields), propertyId];

    try {
        const result = await query(sql, values);
        if (result.affectedRows === 0) {
            return res.status(404).send('Property not found.');
        }
        res.status(200).send('Property updated successfully');
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).send('Error updating property: ' + error.message);
    }
});

app.get('/detail/:propertyId', (req, res) => {
    const { propertyId } = req.params;

    const sql = 'SELECT * FROM property WHERE 순번 = ?';

    db.query(sql, [propertyId], (err, results) => {
        if (err) {
            console.error('Error fetching property details:', err);
            return res.status(500).json({ message: 'Error fetching property details' });
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    });
});



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath); // Create the uploads folder if it doesn't exist
        }
        cb(null, uploadPath); // Specify the folder to store uploaded files
    },
    filename: (req, file, cb) => {
        // Use the original filename for the file, keeping the extension
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    dest: 'uploads/', // Destination folder for uploaded files
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    },
    fileFilter: (req, file, cb) => {
        // Accept only certain file types
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

app.post('/upload-images/:propertyId', upload.array('images', 10), async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const newImagePaths = req.files.map(file => file.path); // Get the paths of the uploaded images

        // Retrieve the current image paths for the given propertyId
        const currentResult = await query('SELECT img_path FROM property WHERE 순번 = ?', [propertyId]);
        
        if (currentResult.length === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        const currentImagePaths = currentResult[0].img_path ? currentResult[0].img_path.split(',') : [];

        // Combine current and new image paths
        const updatedImagePaths = [...currentImagePaths, ...newImagePaths];
        const updatedImagePathsString = updatedImagePaths.join(',');

        // Update the property with the new image paths
        await query('UPDATE property SET img_path = ? WHERE 순번 = ?', [updatedImagePathsString, propertyId]);

        res.status(200).json({ imageUrls: newImagePaths });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ error: 'Failed to upload images' });
    }
});

app.post('/upload-images', upload.array('images'), (req, res) => {
    const imagePaths = req.files.map(file => file.path); // Get the paths of uploaded images
    res.json({ images: imagePaths });
});


app.get('/properties/:propertyId/images', async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        
        // Execute the query and get the results
        const query = 'SELECT img_path FROM property WHERE 순번 = ?';
        db.query(query, [propertyId], (error, results) => {
            if (error) {
                console.error('Error executing query:', error);
                return res.status(500).json({ error: 'Failed to fetch images' });
            }

            // Check if the property exists
            if (results.length === 0) {
                return res.status(404).json({ error: 'Property not found' });
            }

            // Extract the image paths and split them into an array
            const imgPaths = results[0].img_path ? results[0].img_path.split(',') : [];
            res.json({ images: imgPaths });
        });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ error: 'Failed to fetch images' });
    }
});


// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/memos/:propertyId', async (req, res) => {
    const { propertyId } = req.params;

    try {
        const query = 'SELECT 메모 FROM property WHERE 순번 = ?';
        db.query(query, [propertyId], (err, result) => {
            if (err) {
                console.error('Error fetching memo:', err);
                return res.status(500).json({ error: 'Failed to fetch memo' });
            }

            if (result.length === 0) {
                return res.status(404).json({ message: 'Property not found' });
            }

            res.json({ 메모: result[0].메모 || '' }); // Return the memo or empty if null
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch memo' });
    }
});


// Route to add a memo
app.post('/memos/add', async (req, res) => {
    const { propertyId, content } = req.body;

    try {
        // Execute the query using db.query (for mysql package)
        db.query('UPDATE property SET 메모 = ? WHERE 순번 = ?', [content, propertyId], (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                return res.status(500).json({ error: 'Failed to update memo' });
            }

            // Check if any rows were affected (indicating success)
            if (result.affectedRows > 0) {
                res.json({ id: propertyId, content }); // Return the updated memo
            } else {
                res.status(404).json({ error: 'Property not found' });
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Failed to update memo' });
    }
});






app.post('/properties/update', (req, res) => {
    const propertyData = req.body;
  
    db.query(
      'INSERT INTO property SET ? ON DUPLICATE KEY UPDATE ?',
      [propertyData, propertyData],
      (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Error saving property data');
        }
        res.send('Property data saved successfully');
      }
    );
  });
  

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});

require('dotenv').config();
const express = require("express");
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require("mysql");
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // For file system operations
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require('express-jwt'); // Import the express-jwt middleware

const { PROPERTY_TYPES, TRANSACTION_METHOD, TRANSACTION_STATUS } = require('./constants'); // Import the constants


const JWT_SECRET = 'your_super_secret_key';

const corsOptions = {
    origin: 'http://localhost:5173', // Update to match your frontend's URL
    credentials: true,
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser()); // Enables parsing of cookies


app.use(session({
    secret: process.env.SESSION_SECRET, // Use environment variable for session secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set secure: true if using HTTPS
}));

// JWT Middleware to extract token from the cookie
app.use(
    jwtMiddleware({
        secret: JWT_SECRET, // The same secret you used to sign the token
        algorithms: ['HS256'], // The algorithm used for signing the token
        getToken: (req) => req.cookies.authToken, // Extract token from cookies
    }).unless({ path: [
        '/login', 
        '/listing',
        /^\/detail\/.*/, 
        /^\/properties\/\d+\/images$/,
        /^\/delete-property\/\d+$/, 
        /^\/update-property\/\d+$/, 
        /^\/upload-images\/.*$/,
        '/upload-images',
        '/property-types',
        '/transaction-methods',
        '/transaction-status',
        '/properties/update',
        '/address-excel'
    ] }) 
);

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

// Constant
app.get('/property-types', (req, res) => {
    res.json(PROPERTY_TYPES);  // Send the enum values to the frontend
});

app.get('/transaction-methods', (req, res) => {
    res.json(TRANSACTION_METHOD);  // Send the enum values to the frontend
});

app.get('/transaction-status', (req, res) => {
    res.json(TRANSACTION_STATUS);  // Send the enum values to the frontend
});


// Import CSV / excel
app.post('/import-csv', (req, res) => {
    const properties = req.body; // JSON data from the frontend
    const uniqueFields = properties.map(item => item['매물ID']); // Using '순번' as the unique identifier
    console.log(uniqueFields);

    // Query to fetch existing records with the same 순번
    const query = `SELECT 매물ID FROM property WHERE 매물ID IN (?)`;

    db.query(query, [uniqueFields], (err, results) => {
        if (err) {
            console.error('Error fetching existing properties:', err);
            return res.status(500).send('Error checking existing data');
        }

        const existingFields = results.map(row => row['매물ID']); // List of IDs that already exist in DB
        const newRecords = properties.filter(item => !existingFields.includes(item['매물ID'])); // Records to insert
        const updateRecords = properties.filter(item => existingFields.includes(item['매물ID'])); // Records to update

        const promises = [];

        // Insert new records
        if (newRecords.length > 0) {
            const insertValues = newRecords.map(item => [
                item['순번'] || 0,
                item['매물ID'] || null,
                item['등록일자'] || null,
                item['사용승인일자'] || null,
                item['부동산구분'] || '',
                item['거래방식'] || '',
                item['거래완료여부'] || '',
                item['거래완료일자'] || null,
                item['담당자'] || '',
                item['상세주소'] || '',
                item['건물명'] || '',
                item['동'] || 0,
                item['호수'] || 0,
                item['보증금'] || 0,
                item['월세'] || 0,
                item['관리비'] || 0,
                item['전체m2'] || 0,
                item['전용m2'] || 0,
                item['전체평'] || 0,
                item['전용평'] || 0,
                item['EV유무'] || 0,
                item['화장실개수'] || 0,
                item['층수'] || 0,
                item['주차가능대수'] || 0,
                item['비밀번호'] || '',
                JSON.stringify(item['연락처']) || '{}', // Serialize 연락처 as a JSON string
                item['메모'] || '',
                item['address_id'] || '',
            ]);


            const insertSql = `INSERT INTO property (순번, 매물ID, 등록일자, 사용승인일자, 부동산구분, 거래방식, 거래완료여부, 거래완료일자, 담당자, 상세주소, 건물명, 동, 호수, 보증금, 월세, 관리비, 전체m2, 전용m2, 전체평, 전용평, EV유무, 화장실개수, 층수, 주차가능대수, 비밀번호, 연락처, 메모, address_id) VALUES ?`;

            promises.push(new Promise((resolve, reject) => {
                db.query(insertSql, [insertValues], (err, result) => {
                    if (err) {
                        console.error('Error inserting data:', err);
                        reject('Error inserting data');
                    } else {
                        console.log(`${newRecords.length} new records inserted successfully.`);
                        resolve();
                    }
                });
            }));
        }

        // Update existing records
        if (updateRecords.length > 0) {
            updateRecords.forEach(item => {
                const updateFields = [];

                // Loop through the fields you want to update
                if (item['매물ID']) updateFields.push(`매물ID = ${db.escape(item['매물ID'])}`);
                if (item['사용승인일자']) updateFields.push(`사용승인일자 = ${db.escape(item['사용승인일자'])}`);
                if (item['등록일자']) updateFields.push(`등록일자 = ${db.escape(item['등록일자'])}`);
                if (item['부동산구분']) updateFields.push(`부동산구분 = ${db.escape(item['부동산구분'])}`);
                if (item['거래방식']) updateFields.push(`거래방식 = ${db.escape(item['거래방식'])}`);
                if (item['거래완료여부']) updateFields.push(`거래완료여부 = ${db.escape(item['거래완료여부'])}`);
                if (item['거래완료일자']) updateFields.push(`거래완료일자 = ${db.escape(item['거래완료일자'])}`);
                if (item['담당자']) updateFields.push(`담당자 = ${db.escape(item['담당자'])}`);
                if (item['건물명']) updateFields.push(`건물명 = ${db.escape(item['건물명'])}`);
                if (item['상세주소']) updateFields.push(`상세주소 = ${db.escape(item['상세주소'])}`);
                if (item['동']) updateFields.push(`동 = ${db.escape(item['동'])}`);
                if (item['호수']) updateFields.push(`호수 = ${db.escape(item['호수'])}`);
                if (item['보증금']) updateFields.push(`보증금 = ${db.escape(item['보증금'])}`);
                if (item['월세']) updateFields.push(`월세 = ${db.escape(item['월세'])}`);
                if (item['관리비']) updateFields.push(`관리비 = ${db.escape(item['관리비'])}`);
                if (item['전체m2']) updateFields.push(`전체m2 = ${db.escape(item['전체m2'])}`);
                if (item['전용m2']) updateFields.push(`전용m2 = ${db.escape(item['전용m2'])}`);
                if (item['전체평']) updateFields.push(`전체평 = ${db.escape(item['전체평'])}`);
                if (item['전용평']) updateFields.push(`전용평 = ${db.escape(item['전용평'])}`);
                if (item['EV유무']) updateFields.push(`EV유무 = ${db.escape(item['EV유무'])}`);
                if (item['화장실개수']) updateFields.push(`화장실개수 = ${db.escape(item['화장실개수'])}`);
                if (item['층수']) updateFields.push(`층수 = ${db.escape(item['층수'])}`);
                if (item['주차가능대수']) updateFields.push(`주차가능대수 = ${db.escape(item['주차가능대수'])}`);
                if (item['비밀번호']) updateFields.push(`비밀번호 = ${db.escape(item['비밀번호'])}`);
                if (item['연락처']) updateFields.push(`연락처 = ${db.escape(item['연락처'])}`);
                if (item['메모']) updateFields.push(`메모 = ${db.escape(item['메모'])}`);
                if (item['address_id']) updateFields.push(`address_id = ${db.escape(item['address_id'])}`);

                if (updateFields.length > 0) {
                    const updateSql = `UPDATE property SET ${updateFields.join(', ')} WHERE 매물ID = ${db.escape(item['매물ID'])}`;

                    promises.push(new Promise((resolve, reject) => {
                        db.query(updateSql, (err, result) => {
                            if (err) {
                                console.error(`Error updating record with 순번 ${item['매물ID']}:`, err);
                                reject(`Error updating record with 순번 ${item['매물ID']}`);
                            } else {
                                resolve();
                            }
                        });
                    }));
                }
            });
        }

        // Wait for all queries to finish
        Promise.all(promises)
            .then(() => {
                res.status(200).send('Records processed successfully.');
            })
            .catch((err) => {
                console.error('Error processing records:', err);
                res.status(500).send('Error processing records');
            });
    });
});




app.post('/login', async (req, res) => {
    try {
        const { email, pw } = req.body;
        const query = 'SELECT * FROM users WHERE email = ?';

        // Query the database for the user
        db.query(query, [email], async (err, results) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).send('Error fetching user');
            }

            if (results.length > 0) {
                const user = results[0];
                const match = await bcrypt.compare(pw, user.password);

                if (match) {
                    // If the password matches, create a JWT token
                    const token = jwt.sign({ id: user.id, email: user.email, fname: user.fname, lname:user.lname }, JWT_SECRET, { expiresIn: '1h' });

                    // Set the JWT token in an HTTP-only cookie
                    res.cookie('authToken', token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                        maxAge: 3600000 // 1 hour
                    });

                    // Send the user data back to the client (without the password)
                    const { password, ...userWithoutPassword } = user;
                    return res.status(200).json({ user: userWithoutPassword, message: 'Login successful' });
                } else {
                    // If the password is incorrect
                    return res.status(401).send('Invalid credentials');
                }
            } else {
                // If no user is found with that email
                return res.status(401).send('Invalid credentials');
            }
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return res.status(500).send('Server error');
    }
});


app.get('/check-auth', (req, res) => {
    // If the token is valid, express-jwt attaches the decoded token to req.auth
    if (req.auth) {
        return res.status(200).json({
            message: 'Authenticated',
            user: req.auth, 
        });
    } else {
        return res.status(401).json({ message: 'Not authenticated' });
    }
});


// Protected route (accessible only with a valid JWT)
app.get('/protected', jwtMiddleware, (req, res) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    next();
});

// Handle invalid JWT errors
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    next();
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
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure only in production
        sameSite: 'strict',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
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

app.delete('/delete-property/:propertyId', (req, res) => {
    const propertyId = req.params.propertyId;

    // SQL query to delete a property by its ID
    const query = 'DELETE FROM property WHERE 순번 = ?';

    db.query(query, [propertyId], (err, result) => {
        if (err) {
            console.error('Error deleting property:', err);
            return res.status(500).json({ error: 'Failed to delete property' });
        }

        if (result.affectedRows > 0) {
            res.json({ message: 'Property deleted successfully!' });
        } else {
            res.status(404).json({ error: 'Property not found' });
        }
    });
});


// Set up multer storage configuration
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

// Configure multer to use diskStorage
const upload = multer({
    storage, // No need to specify `dest` since we're using diskStorage
    limits: {
        fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
    },
    fileFilter: (req, file, cb) => {
        // Accept only certain file types (jpeg, jpg, png)
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed')); // Return an error if file type is invalid
        }
    }
});

app.post('/upload-images/:propertyId', upload.array('images', 10), async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const newImagePaths = req.files.map(file => `/uploads/${path.basename(file.path)}`); // Get relative paths

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
    const imagePaths = req.files.map(file => {
        // Extract the part of the path that starts with '/uploads/'
        const relativePath = file.path.split('/uploads/')[1];
        return `/uploads/${relativePath}`;
    });

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
      'INSERT INTO property SET ? ',
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

  app.get('/get-favorites', (req, res) => {
    const userId = req.auth.id; // Get user ID from JWT payload

    db.query('SELECT favorite FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Error fetching favorites:', err);
            return res.status(500).json({ error: 'Failed to fetch favorites' });
        }

        if (results.length > 0) {
            const favorites = JSON.parse(results[0].favorite); // Assuming 'favorite' is a JSON array
            return res.status(200).json({ favorites });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    });
});

app.post('/save-favorites', (req, res) => {
    const userId = req.auth.id;  // Get user ID from JWT payload
    const { favorites } = req.body;  // Get favorites array from the request body

    // Convert the array of favorite IDs to a JSON string
    const favoriteString = JSON.stringify(favorites);

    // Update the 'favorite' column for the user in the 'users' table
    db.query('UPDATE users SET favorite = ? WHERE id = ?', [favoriteString, userId], (err, result) => {
        if (err) {
            console.error('Error updating favorites:', err);
            return res.status(500).json({ error: 'Failed to save favorites' });
        }

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Favorites saved successfully' });
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    });
});

// Endpoint to search addresses based on Excel data
app.get('/address-excel', (req, res) => {
    // Destructure address components from the request query parameters
    const { 시군구, 읍면동, 리명, 지번본번, 지번부번 } = req.query;
    
    // Construct the SQL query to search for matching addresses in the database
    const query = `
      SELECT 건물관리번호 
      FROM old_address
      WHERE 시군구 LIKE CONCAT('%', ?, '%')
        AND 읍면동 LIKE CONCAT('%', ?, '%')
        AND (리명 LIKE CONCAT('%', ?, '%') OR 리명 IS NULL)
        AND 지번본번 LIKE CONCAT('%', ?, '%')
        AND 지번부번 LIKE CONCAT('%', ?, '%')
    `;
  
    // Use the received parameters as query values
    const queryParams = [시군구, 읍면동, 리명, 지번본번, 지번부번];
    console.log(queryParams);
    
    db.query(query, queryParams, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).json({ error: 'Database error occurred' });
      }
  
      // Return the address IDs in the response
      const addressIds = results.map(row => row.건물관리번호); // Assuming 건물관리번호 is the correct field
      console.log(addressIds);
      res.json({ addressIds });
    });
  });
  
  
  
  
  


app.listen(8000, () => {
    console.log('Server is running on port 8000');
});

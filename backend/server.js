require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // For file system operations
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require('express-jwt'); // Import the express-jwt middleware
const jwtSecret = process.env.JWT_SECRET || 'default_secret_key';

const {
  PROPERTY_TYPES,
  TRANSACTION_METHOD,
  TRANSACTION_STATUS,
} = require('./constants'); // Import the constants

const corsOptions = {
  origin: 'http://localhost:5173', // Update to match your frontend's URL
  credentials: true,
};

const db = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 8889,
});

const sessionStore = new MySQLStore(db);

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser()); // Enables parsing of cookies

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Use environment variable for session secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }, // Secure cookies in production
  })
);

// JWT Middleware to protect routes
app.use(
  jwtMiddleware({
    secret: process.env.JWT_SECRET, // Use environment variable for JWT secret
    algorithms: ['HS256'], // The algorithm used for signing the token
    getToken: (req) => req.cookies.authToken, // Extract token from cookies
  }).unless({
    path: [
      '/login',
      '/listing',
      /^\/detail\/.*/, // Matches /detail/{any path}
      /^\/properties\/\d+\/images$/, // Matches /properties/{id}/images
      /^\/delete-property\/\d+$/, // Matches /delete-property/{id}
      /^\/update-property\/\d+$/, // Matches /update-property/{id}
      /^\/upload-images\/\d*$/, // Matches /upload-images/{id}
      '/upload-images',
      '/property-types',
      '/transaction-methods',
      '/transaction-status',
      '/properties/update',
      '/addresses',
      '/generate-sql',
      '/address-excel',
      /^\/get-address\/\d+$/,
    ],
  })
);

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
  res.json(PROPERTY_TYPES); // Send the enum values to the frontend
});

app.get('/transaction-methods', (req, res) => {
  res.json(TRANSACTION_METHOD); // Send the enum values to the frontend
});

app.get('/transaction-status', (req, res) => {
  res.json(TRANSACTION_STATUS); // Send the enum values to the frontend
});

// Import CSV / excel
app.post('/import-csv', (req, res) => {
  const properties = req.body; // JSON data from the frontend
  const uniqueFields = properties.map((item) => item['매물ID']); // Using '매물ID' as the unique identifier

  // Query to fetch existing records with the same 매물ID
  const query = `SELECT 매물ID FROM property WHERE 매물ID IN (?)`;

  db.query(query, [uniqueFields], (err, results) => {
    if (err) {
      console.error('Error fetching existing properties:', err);
      return res.status(500).send('Error checking existing data');
    }

    const existingFields = results.map((row) => row['매물ID']); // List of IDs that already exist in DB
    const newRecords = properties.filter(
      (item) => !existingFields.includes(item['매물ID'])
    ); // Records to insert
    const updateRecords = properties.filter((item) =>
      existingFields.includes(item['매물ID'])
    ); // Records to update

    const promises = [];

    // Insert new records
    if (newRecords.length > 0) {
      const insertValues = newRecords.map((item) => [
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

      const insertSql = `INSERT INTO property (매물ID, 등록일자, 사용승인일자, 부동산구분, 거래방식, 거래완료여부, 거래완료일자, 담당자, 상세주소, 건물명, 동, 호수, 보증금, 월세, 관리비, 전체m2, 전용m2, 전체평, 전용평, EV유무, 화장실개수, 층수, 주차가능대수, 비밀번호, 연락처, 메모, address_id) VALUES ?`;

      promises.push(
        new Promise((resolve, reject) => {
          db.query(insertSql, [insertValues], (err, result) => {
            if (err) {
              console.error('Error inserting data:', err);
              reject('Error inserting data');
            } else {
              console.log(
                `${newRecords.length} new records inserted successfully.`
              );
              resolve();
            }
          });
        })
      );
    }

    // Update existing records
    if (updateRecords.length > 0) {
      updateRecords.forEach((item) => {
        const updateFields = [];

        // Loop through the fields you want to update
        if (item['매물ID'])
          updateFields.push(`매물ID = ${db.escape(item['매물ID'])}`);
        if (item['사용승인일자'])
          updateFields.push(
            `사용승인일자 = ${db.escape(item['사용승인일자'])}`
          );
        if (item['등록일자'])
          updateFields.push(`등록일자 = ${db.escape(item['등록일자'])}`);
        if (item['부동산구분'])
          updateFields.push(`부동산구분 = ${db.escape(item['부동산구분'])}`);
        if (item['거래방식'])
          updateFields.push(`거래방식 = ${db.escape(item['거래방식'])}`);
        if (item['거래완료여부'])
          updateFields.push(
            `거래완료여부 = ${db.escape(item['거래완료여부'])}`
          );
        if (item['거래완료일자'])
          updateFields.push(
            `거래완료일자 = ${db.escape(item['거래완료일자'])}`
          );
        if (item['담당자'])
          updateFields.push(`담당자 = ${db.escape(item['담당자'])}`);
        if (item['구']) updateFields.push(`구 = ${db.escape(item['구'])}`);
        if (item['읍면동'])
          updateFields.push(`읍면동 = ${db.escape(item['읍면동'])}`);
        if (item['구상세주소'])
          updateFields.push(`구상세주소 = ${db.escape(item['구상세주소'])}`);
        if (item['도로명'])
          updateFields.push(`도로명 = ${db.escape(item['도로명'])}`);
        if (item['신상세주소'])
          updateFields.push(`신상세주소 = ${db.escape(item['신상세주소'])}`);
        if (item['건물명'])
          updateFields.push(`건물명 = ${db.escape(item['건물명'])}`);
        if (item['동']) updateFields.push(`동 = ${db.escape(item['동'])}`);
        if (item['호수'])
          updateFields.push(`호수 = ${db.escape(item['호수'])}`);
        if (item['보증금'])
          updateFields.push(`보증금 = ${db.escape(item['보증금'])}`);
        if (item['월세'])
          updateFields.push(`월세 = ${db.escape(item['월세'])}`);
        if (item['관리비'])
          updateFields.push(`관리비 = ${db.escape(item['관리비'])}`);
        if (item['전체m2'])
          updateFields.push(`전체m2 = ${db.escape(item['전체m2'])}`);
        if (item['전용m2'])
          updateFields.push(`전용m2 = ${db.escape(item['전용m2'])}`);
        if (item['전체평'])
          updateFields.push(`전체평 = ${db.escape(item['전체평'])}`);
        if (item['전용평'])
          updateFields.push(`전용평 = ${db.escape(item['전용평'])}`);
        if (item['EV유무'])
          updateFields.push(`EV유무 = ${db.escape(item['EV유무'])}`);
        if (item['화장실개수'])
          updateFields.push(`화장실개수 = ${db.escape(item['화장실개수'])}`);
        if (item['층수'])
          updateFields.push(`층수 = ${db.escape(item['층수'])}`);
        if (item['방개수'])
          updateFields.push(`방개수 = ${db.escape(item['방개수'])}`);
        if (item['주차가능대수'])
          updateFields.push(
            `주차가능대수 = ${db.escape(item['주차가능대수'])}`
          );
        if (item['비밀번호'])
          updateFields.push(`비밀번호 = ${db.escape(item['비밀번호'])}`);
        if (item['연락처'])
          updateFields.push(`연락처 = ${db.escape(item['연락처'])}`);
        if (item['메모'])
          updateFields.push(`메모 = ${db.escape(item['메모'])}`);

        if (updateFields.length > 0) {
          const updateSql = `UPDATE property SET ${updateFields.join(
            ', '
          )} WHERE 매물ID = ${db.escape(item['매물ID'])}`;

          promises.push(
            new Promise((resolve, reject) => {
              db.query(updateSql, (err, result) => {
                if (err) {
                  console.error(
                    `Error updating record with 매물ID ${item['매물ID']}:`,
                    err
                  );
                  reject(`Error updating record with 매물ID ${item['매물ID']}`);
                } else {
                  resolve();
                }
              });
            })
          );
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
          const token = jwt.sign(
            {
              id: user.id,
              email: user.email,
              fname: user.fname,
              lname: user.lname,
            },
            jwtSecret,
            { expiresIn: '1h' }
          );

          // Set the JWT token in an HTTP-only cookie
          res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000, // 1 hour
          });

          // Send the user data back to the client (without the password)
          const { password, ...userWithoutPassword } = user;
          return res
            .status(200)
            .json({ user: userWithoutPassword, message: 'Login successful' });
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
      return res
        .status(500)
        .send('An error occurred while updating the profile.');
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

  const query =
    'INSERT INTO users (fname, lname, email, password) VALUES (?, ?, ?, ?)';
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
    .map((key) => `${key} = ?`)
    .join(', ');

  const sql = `UPDATE property SET ${setClause} WHERE 매물ID = ?`;

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

  const sql = 'SELECT * FROM property WHERE 매물ID = ?';

  db.query(sql, [propertyId], (err, results) => {
    if (err) {
      console.error('Error fetching property details:', err);
      return res
        .status(500)
        .json({ message: 'Error fetching property details' });
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
  const query = 'DELETE FROM property WHERE 매물ID = ?';

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
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed')); // Return an error if file type is invalid
    }
  },
});

app.post(
  '/upload-images/:propertyId',
  upload.array('images', 10),
  async (req, res) => {
    try {
      const propertyId = req.params.propertyId;

      // Get the new image paths from uploaded files
      const newImagePaths = req.files.map(
        (file) => `/uploads/${path.basename(file.path)}`
      );

      // Retrieve the current image paths for the given propertyId
      const currentResult = await query(
        'SELECT img_path FROM property WHERE 매물ID = ?',
        [propertyId]
      );
      const currentImagePaths = currentResult[0].img_path
        ? currentResult[0].img_path
            .split(',')
            .map((imgPath) =>
              imgPath.includes('/uploads/')
                ? imgPath.trim()
                : `/uploads/${path.basename(imgPath.trim())}`
            )
        : [];

      // Combine current and new image paths
      const updatedImagePaths = [...currentImagePaths, ...newImagePaths];
      const updatedImagePathsString = updatedImagePaths.join(',');

      // Update the property with the new image paths
      await query('UPDATE property SET img_path = ? WHERE 매물ID = ?', [
        updatedImagePathsString,
        propertyId,
      ]);

      res.status(200).json({ imageUrls: newImagePaths });
    } catch (error) {
      console.error('Error uploading images:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  }
);

app.post('/upload-images', upload.array('images'), (req, res) => {
  try {
    const imagePaths = req.files.map((file) => {
      const uploadsIndex = file.path.indexOf('/uploads/');

      // Ensure '/uploads/' exists in the file path
      if (uploadsIndex === -1) {
        throw new Error(
          `Invalid path: ${file.path} does not contain '/uploads/'`
        );
      }

      // Extract the relative path using the index and ensure cross-platform compatibility
      const relativePath = file.path.substring(uploadsIndex);
      return path.posix.join(relativePath); // Ensures '/' separator is used on all platforms
    });

    res.json({ images: imagePaths });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/properties/:propertyId/images', async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    // Execute the query and get the results
    const query = 'SELECT img_path FROM property WHERE 매물ID = ?';
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
      const imgPaths = results[0].img_path
        ? results[0].img_path.split(',')
        : [];
      res.json({ images: imgPaths });
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.get('/memos/:propertyId', async (req, res) => {
//   const { propertyId } = req.params;

//   try {
//     const query = 'SELECT 메모 FROM property WHERE 매물ID = ?';
//     db.query(query, [propertyId], (err, result) => {
//       if (err) {
//         console.error('Error fetching memo:', err);
//         return res.status(500).json({ error: 'Failed to fetch memo' });
//       }

//       if (result.length === 0) {
//         return res.status(404).json({ message: 'Property not found' });
//       }

//       res.json({ 메모: result[0].메모 || '' }); // Return the memo or empty if null
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to fetch memo' });
//   }
// });

// // Route to add a memo
// app.post('/memos/add', async (req, res) => {
//   const { propertyId, content } = req.body;

//   try {
//     // Execute the query using db.query (for mysql package)
//     db.query(
//       'UPDATE property SET 메모 = ? WHERE 매물ID = ?',
//       [content, propertyId],
//       (error, result) => {
//         if (error) {
//           console.error('Error executing query:', error);
//           return res.status(500).json({ error: 'Failed to update memo' });
//         }

//         // Check if any rows were affected (indicating success)
//         if (result.affectedRows > 0) {
//           res.json({ id: propertyId, content }); // Return the updated memo
//         } else {
//           res.status(404).json({ error: 'Property not found' });
//         }
//       }
//     );
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     res.status(500).json({ error: 'Failed to update memo' });
//   }
// });

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

  db.query(
    'SELECT favorite FROM users WHERE id = ?',
    [userId],
    (err, results) => {
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
    }
  );
});

app.post('/save-favorites', (req, res) => {
  const userId = req.auth.id; // Get user ID from JWT payload
  const { favorites } = req.body; // Get favorites array from the request body

  // Convert the array of favorite IDs to a JSON string
  const favoriteString = JSON.stringify(favorites);

  // Update the 'favorite' column for the user in the 'users' table
  db.query(
    'UPDATE users SET favorite = ? WHERE id = ?',
    [favoriteString, userId],
    (err, result) => {
      if (err) {
        console.error('Error updating favorites:', err);
        return res.status(500).json({ error: 'Failed to save favorites' });
      }

      if (result.affectedRows > 0) {
        return res
          .status(200)
          .json({ message: 'Favorites saved successfully' });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    }
  );
});

// Address
app.get('/addresses', async (req, res) => {
  const { searchText } = req.query;
  const query = `
    SELECT 
        new_address.시군구 AS new_district, 
        new_address.읍면 AS new_town, 
        new_address.도로명 AS new_road_name, 
        new_address.건물번호본번 AS new_building_main_number, 
        new_address.건물번호부번 AS new_building_sub_number,
        new_address.건물관리번호 AS new_address_id,
        
        old_address.시군구 AS old_district,
        old_address.읍면동 AS old_town, 
        old_address.리명 AS old_village, 
        old_address.지번본번 AS old_lot_main_number,
        old_address.지번부번 AS old_lot_sub_number,
        old_address.시군구용건물명 AS old_building_name

    FROM 
        new_address
    JOIN 
        old_address ON new_address.건물관리번호 = old_address.건물관리번호
    WHERE 
            new_address.시군구 LIKE ? OR 
            new_address.읍면 LIKE ? OR 
            new_address.도로명 LIKE ? OR 
            old_address.시군구 LIKE ? OR 
            old_address.읍면동 LIKE ? OR 
            old_address.리명 LIKE ?
    
    `;

  // Execute the query, applying the searchText for partial matching
  db.query(
    query,
    [
      `%${searchText}%`, // new_address.시구군
      `%${searchText}%`, // new_address.읍면
      `%${searchText}%`, // new_address.도로명
      `%${searchText}%`, // old_address.시군구
      `%${searchText}%`, // old_address.읍면
      `%${searchText}%`, // old_address.리명
    ],
    (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Database query failed' });
      }

      // Send the results back as JSON
      res.json(results);
    }
  );
});

// SQL table name
const tableName = 'new_address';

function generateSQLInsert(jsonData) {
  return jsonData.map((item) => {
    // Exclude '우편번호' and '시도' from columns and values
    const filteredItem = Object.keys(item)
      .filter((key) => key !== '우편번호' && key !== '시도')
      .reduce((obj, key) => {
        obj[key] = item[key];
        return obj;
      }, {});

    const columns = Object.keys(filteredItem).join(', ');
    const values = Object.values(filteredItem)
      .map((value) => `'${value}'`)
      .join(', ');

    return `INSERT INTO ${tableName} (${columns}) VALUES (${values});`;
  });
}

/**
 * This API endpoint (/generate-sql) reads a new_address.json file, parses the JSON data, generates SQL INSERT statements, and inserts the data into a database.
 * If any errors occur during file reading, JSON parsing, or database insertion, it returns a 500 error.
 * If successful, it confirms the data has been inserted into the database.
 * For additional details, refer to the README.md file located in the backend folder.
 **/

app.get('/generate-sql', (req, res) => {
  const filePath = path.join(__dirname, 'new_address.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file');
    }

    try {
      // Parse JSON data
      const jsonData = JSON.parse(data);

      // Generate SQL statements
      const sqlStatements = generateSQLInsert(jsonData);

      // Insert each statement into the database
      sqlStatements.forEach((sql) => {
        db.query(sql, (err, result) => {
          if (err) {
            console.error('Error executing query:', err);
            return res.status(500).send('Error executing query');
          }
          console.log('Data inserted:', result);
        });
      });

      res.send('Data inserted successfully into the database!');
    } catch (jsonError) {
      console.error('Error parsing JSON:', jsonError);
      return res.status(500).send('Error parsing JSON');
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

  db.query(query, queryParams, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      return res.status(500).json({ error: 'Database error occurred' });
    }

    // Return the address IDs in the response
    const addressIds = results.map((row) => row.건물관리번호); // Assuming 건물관리번호 is the correct field
    console.log(addressIds);
    res.json({ addressIds });
  });
});

// API to get rows from new-address and old-address tables using 매물ID
app.get('/get-address/:id', async (req, res) => {
  const { id } = req.params; // Get the 매물ID from the URL parameter
  try {
    // Query to fetch row from new-address
    const newAddressQuery =
      'SELECT * FROM `new_address` WHERE 건물관리번호 = ?';
    const oldAddressQuery =
      'SELECT * FROM `old_address` WHERE 건물관리번호 = ?';

    // Execute both queries
    db.query(newAddressQuery, [id], (err, newAddressResult) => {
      if (err) {
        console.error('Error fetching new address:', err);
        return res
          .status(500)
          .json({ message: 'Database error fetching new address' });
      }

      // After getting the new address, fetch the old address
      db.query(oldAddressQuery, [id], (err, oldAddressResult) => {
        if (err) {
          console.error('Error fetching old address:', err);
          return res
            .status(500)
            .json({ message: 'Database error fetching old address' });
        }

        // Combine both results and send as response
        res.json({
          newAddress: newAddressResult.length > 0 ? newAddressResult[0] : null,
          oldAddress: oldAddressResult.length > 0 ? oldAddressResult[0] : null,
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/search-address', (req, res) => {
  const searchText = req.query.q;
  console.log('searchText', searchText);

  const query = `
    SELECT 건물관리번호 FROM old_address
    WHERE 시군구 LIKE ? OR 읍면 LIKE ? OR 도로명 LIKE ?
    UNION
    SELECT 건물관리번호 FROM new_address
    WHERE 시군구 LIKE ? OR 읍면 LIKE ? OR 도로명 LIKE ?;
  `;

  const searchPattern = `%${searchText}%`;

  db.query(
    query,
    [
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
      searchPattern,
    ],
    (error, results) => {
      if (error) {
        console.error('Error retrieving addresses:', error);
        return res.status(500).json({ error: 'Failed to retrieve addresses' });
      }

      const addressIds = results.map((row) => row.건물관리번호);
      res.json({ addressIds });
    }
  );
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});

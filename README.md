# Golden Key Website(CRUD PROJECT)


## Brief Description
This project is a full-stack CRUD application built with React.js, Node.js, and MySQL for a real estate business. It enables the business owner to upload, manage, and filter properties, facilitating better communication with customers and organization of listings.

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Running the Project](#running-the-project)
4. [Testing the Code](#testing-the-code)
5. [Technologies Used](#technologies-used)

---

## Overview

This real estate management system is designed to help a business owner efficiently organize and manage property listings. The web application allows the owner to perform CRUD (Create, Read, Update, Delete) operations on property data, ensuring that listings are always up to date. Users can filter properties based on various criteria, streamlining the search process for both the business and customers. The backend, built with Node.js and Express, handles all the server-side logic, while MySQL serves as the database for storing property data. React.js is used to create a dynamic and user-friendly frontend. This platform also aims to improve communication between the business and its clients, allowing for seamless interaction regarding property listings.


## Installation


### Prerequisites

Make sure you have the following installed on your system:

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [MAMP](https://www.mamp.info/en/) 
### Steps to Install

1. **Clone the repository:**

   git clone https://github.com/yoo-ran/goldenkey.git
   cd goldenkey

2. **Install dependencies:**

- Frontend
   ```bash
    cd frontend
    npm install
    ```

- Backend
    ```bash
    cd ../backend
    npm install
    ```

3. **Database Setup:**

   - Start MAMP or your preferred local environment.
   - Make sure the database credentials match your setup in the backend configuration files
   - Create a new MySQL database with the same name as your exported file:

     ```sql
     CREATE DATABASE userlists;
     USE userlists;
     ```

   - Import your exported SQL file `userlists.sql` via phpMyAdmin or directly through a terminal command:

     ```bash
     mysql -u root -p userlists < backend/config/userlists.sql
     ```

## Running the Project

1. Frontend

   ```bash
    cd frontend
    npm run dev
    ```

    // This makes it clear that while `localhost:5173` is the default, it could be different depending on the system. Let me know if that works!


2. Backend

   ```bash
    cd backend
    npm start
    ```

    // This makes it clear that while `localhost:8000` is the default, it could be different depending on the system. Let me know if that works!


3. Database
    - Open MAMP (or another database tool like XAMPP or Docker).
    - Start your MySQL server through MAMP.

## Testing the Code

1. **Frontend Testing:**

   - Ensure the frontend server is running (`npm run dev`), and check the application in the browser (default: `http://localhost:5173`).
   - Test the UI elements like property uploads, filtering, and managing (CRUD operations) to ensure they are working as expected.
   - **Login Information:** Use the following credentials to log in:
     - **Email:** `a@mail.com`
     - **Password:** `aaaa`

2. **Backend Testing:**

   - Use tools like [Postman](https://www.postman.com/) or cURL to test API endpoints on `http://localhost:8000`.
   - Send requests to the backend and check that the property data is being correctly fetched, created, updated, and deleted from the database.

3. **Database Testing:**

   - Open phpMyAdmin (or use a MySQL client) to verify that data is being correctly inserted, updated, and deleted in the `userlists` database.



## Technologies Used

- **Frontend:**
  - React.js
  - HTML5/CSS3
  - JavaScript (ES6+)
  - Tailwind

- **Backend:**
  - Node.js
  - Express.js

- **Database:**
  - MySQL (using MAMP as the local server)

- **Tools:**
  - Postman (for testing backend API)
  - MAMP (for local MySQL server)
  - npm (for package management)




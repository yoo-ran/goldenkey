# Address Database Management

This project provides functionality to manage address data in a database. The system uses two JSON files—`new_address.json` and `old_address.json`—to store and update address data. The backend includes an API for saving this data to the database using SQL.

## File Structure

- **`backend/new_address.json`**: Contains the new addresses that will be saved in the database.
- **`backend/old_address.json`**: Contains the old addresses corresponding to the new ones.

### Updating Address Data

If you need to update the address data, follow these steps:

1. **Download the new address files**: Obtain the updated address data and save it as:
   - `new_address.json` for new addresses.
   - `old_address.json` for old addresses.
   
2. **Replace the existing files**: Place the new files in the `backend` folder, replacing the existing `new_address.json` and `old_address.json`.

3. **Save Data to the Database**:
   - You can use the provided API to save the data to the database.

## API for Saving Data

The server includes an API that can be used to save the data from the `new_address.json` and `old_address.json` files into the database. This can be done either through direct calls or by using Postman.

### Endpoints

- **`POST /save-addresses`**: This endpoint allows you to save the address data into the database using SQL.

### Example Usage with Postman

1. Open Postman.
2. Create a new `POST` request.
3. Use the API endpoint `http://localhost:YOUR_PORT/save-addresses`.
4. Send the request to save the addresses from the JSON files to the database.

#### Example Postman Configuration:

- **Request Type**: GET
- **URL**: `http://localhost:8000/generate-sql`
- **Headers**: None required for this endpoint.
- **Body**: Not needed for this GET request.

#### Expected Responses:

- **200 OK**: Data was successfully inserted into the database.
- **500 Internal Server Error**: An issue occurred with file reading, JSON parsing, or database insertion.



## Prerequisites

- Ensure the backend server is running.
- Make sure that the `new_address.json` and `old_address.json` files are properly formatted before sending the request.

## Technologies Used

- **Node.js**: Backend server.
- **MySQL**: For storing address data in the database.
- **Postman**: For testing API endpoints.

## Notes

- The database schema must support the new and old addresses, and both the `new_address` and `old_address` tables should be properly set up before saving data.
- If there are any issues with saving data, ensure that the JSON structure is correct and matches the database schema.

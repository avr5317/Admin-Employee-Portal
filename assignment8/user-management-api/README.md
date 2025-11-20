# User Management API

RESTful API for managing users with secure password handling and image uploads built with Node.js, Express, and MongoDB.

## Author
Avadhanam Vinaya Rekha
lnu.ava@northeastern.edu

## Technologies Used
- Node.js
- Express.js v5.1.0
- MongoDB with Mongoose v8.19.3
- bcrypt v6.0.0 for password hashing
- Multer v2.0.2 for file uploads

## Installation Steps

1. **Clone the repository**
```bash
   git clone 
   cd user-management-api
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/userdb
```

4. **Start MongoDB**
```bash
   net start MongoDB
```

5. **Run the application**
```bash
   npm run dev
```

   The server will start at `http://localhost:3000`

## API Endpoints

### 1. Create User
**POST** `/user/create`

**Request Body (JSON):**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "Password123!"
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully."
}
```

**Error Response (400):**
```json
{
  "error": "Validation failed. All fields are required."
}
```

### 2. Get All Users
**GET** `/user/getAll`

**Success Response (200):**
```json
{
  "users": [
    {
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "password": "$2b$10$hashedpassword..."
    }
  ]
}
```

### 3. Update User
**PUT** `/user/edit`

**Request Body (JSON):**
```json
{
  "email": "john.doe@example.com",
  "fullName": "Jane Doe",
  "password": "NewPassword123!"
}
```

**Success Response (200):**
```json
{
  "message": "User updated successfully."
}
```

**Error Response (404):**
```json
{
  "error": "User not found."
}
```

### 4. Delete User
**DELETE** `/user/delete`

**Request Body (JSON):**
```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "User deleted successfully."
}
```

### 5. Upload Image
**POST** `/user/uploadImage`

**Request Body (form-data):**
- `email`: john.doe@example.com (text)
- `image`: [image file] (file)

**Accepted formats:** JPEG, PNG, GIF
**Maximum file size:** 5MB
**Restriction:** One image per user

**Success Response (201):**
```json
{
  "message": "Image uploaded successfully.",
  "filePath": "/images/john.doe@example.com-1234567890.jpg"
}
```

**Error Response (400):**
```json
{
  "error": "Invalid file format. Only JPEG, PNG, and GIF are allowed."
}
```

## Validation Rules

### Full Name
- Only alphabetic characters and spaces
- Required field

### Email
- Valid email format (example@domain.com)
- Unique (no duplicates)
- Cannot be updated after creation
- Required field

### Password
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (@$!%*?&)
- Hashed using bcrypt before storage
- Required field

### Image Upload
- Only JPEG, PNG, and GIF formats
- One image per user
- Maximum 5MB file size

## Project Structure
```
user-management-api/
├── controllers/
│   └── userController.js    # Business logic for all endpoints
├── middleware/
│   └── upload.js             # Multer configuration for file uploads
├── models/
│   └── User.js               # Mongoose user schema
├── routes/
│   └── userRoutes.js         # API route definitions
├── uploads/
│   └── images/               # Uploaded image storage
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies and scripts
├── README.md                # Documentation
└── server.js                # Application entry point
```

## Testing with Postman

1. Import the provided Postman collection
2. Test endpoints in this order:
   - Create User → Get All Users → Update User → Upload Image → Delete User
3. Test error scenarios:
   - Invalid email format
   - Weak password
   - Duplicate email
   - Upload second image
   - Wrong file format
   - Non-existent user

## Security Features

- **Password Hashing:** All passwords are hashed using bcrypt with salt rounds of 10
- **Input Validation:** All inputs are validated before processing
- **Error Handling:** Comprehensive error handling with appropriate status codes
- **File Upload Security:** Strict file type validation and size limits

## Error Handling

The API uses standard HTTP status codes:
- **200:** Success (GET, PUT, DELETE)
- **201:** Resource created successfully (POST)
- **400:** Bad request / Validation error
- **404:** Resource not found
- **500:** Internal server error

All errors return JSON with descriptive error messages.

## Dependencies
```json
{
  "bcrypt": "^6.0.0",
  "dotenv": "^17.2.3",
  "express": "^5.1.0",
  "mongoose": "^8.19.3",
  "multer": "^2.0.2"
}
```

## Development Dependencies
```json
{
  "nodemon": "^3.1.10"
}
```

## Scripts

- `npm start` - Run the server in production mode
- `npm run dev` - Run the server in development mode with auto-restart

## Notes

- MongoDB must be running before starting the application
- The `.env` file is required for configuration
- Uploaded images are stored locally in the `uploads/images` directory
- The `uploads` folder is git-ignored to prevent committing user files
CRM Backend System
A production-ready REST API for a Customer Relationship Management (CRM) system built with Node.js, Express, MongoDB, and JWT authentication.
Features

🔐 Secure JWT-based authentication
👥 Employee/Counselor management
📝 Public enquiry form submission
🎯 Lead claiming system
📊 Lead management and tracking
🔒 Role-based access control
⚡ Rate limiting and security best practices
📱 RESTful API design
✅ Input validation and error handling

Tech Stack

Runtime: Node.js
Framework: Express.js
Database: MongoDB with Mongoose ODM
Authentication: JWT (JSON Web Tokens)
Security: Helmet, CORS, bcryptjs, express-rate-limit
Validation: express-validator

Project Structure
crm-backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── enquiryController.js # Enquiry management
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── error.js             # Error handling
│   │   └── validators.js        # Input validation
│   ├── models/
│   │   ├── Employee.js          # Employee schema
│   │   └── Enquiry.js           # Enquiry schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── enquiryRoutes.js     # Enquiry endpoints
│   └── server.js                # App entry point
├── .env.example                 # Environment variables template
├── package.json
└── README.md
Installation
Prerequisites

Node.js (v14 or higher)
MongoDB (v4.4 or higher)
npm or yarn

Setup Steps

Clone the repository

bashgit clone <repository-url>
cd crm-backend

Install dependencies

bashnpm install

Configure environment variables

bashcp .env.example .env
Edit .env file with your configuration:
envPORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/crm_database
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_minimum_32_characters
JWT_EXPIRE=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*

Start MongoDB

bash# If using local MongoDB
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

Run the application

bash# Development mode
npm run dev

# Production mode
npm start
The server will start on http://localhost:5000
API Documentation
Base URL
http://localhost:5000/api
Authentication Endpoints
1. Register Employee
httpPOST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "counselor"
}
Response:
json{
  "success": true,
  "message": "Employee registered successfully",
  "data": {
    "employee": {
      "id": "6542abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "counselor",
      "createdAt": "2024-11-03T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
2. Login Employee
httpPOST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
Response:
json{
  "success": true,
  "message": "Login successful",
  "data": {
    "employee": {
      "id": "6542abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "counselor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
3. Get Current Employee
httpGET /api/auth/me
Authorization: Bearer <token>
Enquiry Endpoints
1. Submit Enquiry Form (Public)
httpPOST /api/enquiries
Content-Type: application/json

{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "phone": "1234567890",
  "courseInterest": "Web Development",
  "message": "I want to learn full-stack development",
  "source": "website",
  "priority": "high"
}
Response:
json{
  "success": true,
  "message": "Enquiry submitted successfully. Our team will contact you soon!",
  "data": {
    "id": "6542xyz789abc123",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "courseInterest": "Web Development",
    "submittedAt": "2024-11-03T10:30:00.000Z"
  }
}
2. Get Unclaimed Enquiries
httpGET /api/enquiries/unclaimed?page=1&limit=20
Authorization: Bearer <token>
Response:
json{
  "success": true,
  "count": 5,
  "total": 25,
  "page": 1,
  "pages": 2,
  "data": [
    {
      "_id": "6542xyz789abc123",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "phone": "1234567890",
      "courseInterest": "Web Development",
      "status": "unclaimed",
      "source": "website",
      "priority": "high",
      "createdAt": "2024-11-03T10:30:00.000Z"
    }
  ]
}
3. Claim an Enquiry
httpPOST /api/enquiries/:id/claim
Authorization: Bearer <token>
Response:
json{
  "success": true,
  "message": "Enquiry claimed successfully",
  "data": {
    "_id": "6542xyz789abc123",
    "name": "Alice Smith",
    "email": "alice@example.com",
    "status": "claimed",
    "claimedBy": {
      "_id": "6542abc123def456",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "claimedAt": "2024-11-03T11:00:00.000Z"
  }
}
4. Get My Claimed Enquiries
httpGET /api/enquiries/my-enquiries?page=1&limit=20&status=claimed
Authorization: Bearer <token>
Response:
json{
  "success": true,
  "count": 3,
  "total": 15,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "6542xyz789abc123",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "phone": "1234567890",
      "courseInterest": "Web Development",
      "status": "claimed",
      "claimedBy": {
        "_id": "6542abc123def456",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "claimedAt": "2024-11-03T11:00:00.000Z"
    }
  ]
}
5. Get Single Enquiry Details
httpGET /api/enquiries/:id
Authorization: Bearer <token>
6. Update Enquiry Status
httpPUT /api/enquiries/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "contacted"
}
7. Add Note to Enquiry
httpPOST /api/enquiries/:id/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Called the student, interested in our course"
}
Testing Guide
1. Using cURL
Register a new employee:
bashcurl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
Login:
bashcurl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
Submit enquiry (No auth required):
bashcurl -X POST http://localhost:5000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com",
    "phone": "1234567890",
    "courseInterest": "Web Development"
  }'
Get unclaimed enquiries:
bashcurl -X GET "http://localhost:5000/api/enquiries/unclaimed?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
Claim an enquiry:
bashcurl -X POST http://localhost:5000/api/enquiries/ENQUIRY_ID/claim \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
Get my enquiries:
bashcurl -X GET "http://localhost:5000/api/enquiries/my-enquiries?page=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
2. Using Postman

Import the following as a Postman collection
Create an environment variable token to store JWT
Use {{token}} in Authorization headers

3. Testing Workflow

Register two employees:

Employee 1: counselor1@example.com
Employee 2: counselor2@example.com


Login with Employee 1 and save the token
Submit 5 enquiries using the public form endpoint (no auth)
Get unclaimed enquiries with Employee 1's token (should see all 5)
Claim 2 enquiries with Employee 1's token
Get unclaimed enquiries again (should see only 3 remaining)
Login with Employee 2 and get unclaimed enquiries (should see the same 3)
Claim 1 enquiry with Employee 2's token
Get my enquiries for Employee 1 (should see 2 claimed)
Get my enquiries for Employee 2 (should see 1 claimed)
Try to claim already claimed enquiry (should fail with error)

Security Features

Password hashing with bcrypt
JWT token-based authentication
Rate limiting (100 requests per 15 minutes)
Helmet.js for security headers
CORS protection
Input validation and sanitization
MongoDB injection prevention
Error handling without exposing sensitive info

Error Handling
All errors return in the format:
json{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
Common HTTP status codes:

200 - Success
201 - Created
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
429 - Too Many Requests
500 - Server Error

Production Deployment
Environment Variables
Ensure all production environment variables are set securely:

Use strong JWT_SECRET (minimum 32 characters)
Set NODE_ENV=production
Use MongoDB connection string with authentication
Configure appropriate CORS origins
Adjust rate limits based on expected traffic

Best Practices

Use process manager (PM2) for production
Enable MongoDB authentication
Use environment-specific configs
Implement logging (Winston/Morgan)
Set up monitoring (New Relic, DataDog)
Use HTTPS in production
Regular security audits
Database backups
Use reverse proxy (Nginx)

PM2 Deployment
bashnpm install -g pm2
pm2 start src/server.js --name crm-api
pm2 save
pm2 startup
Database Schema
Employee Collection
javascript{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  role: String (enum: counselor, admin),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
Enquiry Collection
javascript{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  courseInterest: String,
  message: String,
  status: String (enum: unclaimed, claimed, contacted, converted, lost),
  claimedBy: ObjectId (ref: Employee),
  claimedAt: Date,
  source: String,
  priority: String,
  notes: [{
    text: String,
    addedBy: ObjectId (ref: Employee),
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
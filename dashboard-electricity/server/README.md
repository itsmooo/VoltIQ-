# VoltIQ Authentication Server

A secure authentication server for the VoltIQ electricity dashboard with JWT-based authentication, role-based access control, and MongoDB integration.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-based Access Control** - Admin, Analyst, and Viewer roles
- 🛡️ **Security Features** - Rate limiting, input validation, password hashing
- 📊 **User Management** - Create, update, and manage user accounts
- 🔒 **Protected Routes** - Secure API endpoints with authentication
- 📝 **Input Validation** - Comprehensive validation for all inputs
- 🗄️ **Database Integration** - MongoDB with Mongoose ODM

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Python (for ML predictions)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the server directory with the following variables:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Database Configuration
   MONGO_URI=mongodb://localhost:27017/voltiq

   # Optional: MongoDB Atlas (cloud database)
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/voltiq?retryWrites=true&w=majority

   # Security
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

3. **Start MongoDB:**
   - Local: `mongod`
   - Atlas: Use your connection string

4. **Run the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/profile` | Get user profile | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| GET | `/api/auth/users` | Get all users | Admin |
| PUT | `/api/auth/users/:id/status` | Toggle user status | Admin |

### Prediction Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/predict` | Make prediction (protected) | Private |
| POST | `/api/public/predict` | Make prediction (public) | Public |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## User Roles

- **Admin**: Full access to all features and user management
- **Analyst**: Access to predictions and data analysis
- **Viewer**: Basic access to view data and make predictions

## Request Examples

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "viewer"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Protected Request
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Make Prediction
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 25,
    "humidity": 60,
    "dayOfWeek": 1,
    "hour": 14
  }'
```

## Response Format

All API responses follow this format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "token": "jwt_token_here" // Only for auth endpoints
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Comprehensive validation
- **CORS Protection**: Configured for frontend
- **Helmet**: Security headers
- **Role-based Access**: Granular permissions

## Development

### Project Structure
```
server/
├── src/
│   ├── config/
│   │   └── connectDB.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   └── index.js
├── package.json
└── README.md
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run start:integrated` - Start integrated server
- `npm run dev:integrated` - Start integrated server in dev mode

## Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running
2. **JWT Token Issues**: Check JWT_SECRET in .env
3. **CORS Errors**: Verify CORS_ORIGIN in .env
4. **Python Script Errors**: Ensure Python and required packages are installed

## License

This project is part of the VoltIQ electricity dashboard system. 
# Authentication Setup for VoltIQ Electricity Website

This document explains how to set up and use the authentication system that connects the electricity-website frontend to the dashboard-electricity server.

## Prerequisites

1. **Node.js and npm** installed on your system
2. **MongoDB** running locally or a MongoDB Atlas connection string
3. **Python** (for ML predictions, optional)

## Quick Start

### Option 1: Using the provided scripts

#### Windows (Batch)
```bash
# Run the batch script
start-with-server.bat
```

#### Windows (PowerShell)
```powershell
# Run the PowerShell script
.\start-with-server.ps1
```

### Option 2: Manual setup

1. **Start the authentication server:**
   ```bash
   cd ../dashboard-electricity/server
   npm install
   npm start
   ```

2. **Start the electricity website:**
   ```bash
   cd electricity-website
   npm install
   npm run dev
   ```

## Server Configuration

The authentication server runs on `http://localhost:5000` and provides the following endpoints:

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `PUT /api/auth/change-password` - Change password (protected)

## Frontend Configuration

The electricity-website is configured to connect to the authentication server at `http://localhost:5000/api/auth`.

### Authentication Flow

1. **Login:** Users can log in with their email and password
2. **Signup:** New users can create accounts with name, email, and password
3. **Token Management:** JWT tokens are automatically stored in localStorage
4. **Protected Routes:** The app checks authentication status before allowing access to protected pages

### User Roles

The system supports three user roles:
- **viewer** (default) - Basic access to view data
- **analyst** - Access to analysis features
- **admin** - Full access including user management

## Demo Credentials

For testing purposes, you can use these demo credentials:
- **Email:** demo@example.com
- **Password:** password

## Environment Variables

The server uses the following environment variables (create a `.env` file in the server directory):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voltiq
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **Server not starting:**
   - Check if MongoDB is running
   - Verify all dependencies are installed (`npm install`)
   - Check the console for error messages

2. **Authentication not working:**
   - Ensure the server is running on port 5000
   - Check browser console for CORS errors
   - Verify the API_URL in AuthContext.tsx
   - **CORS Error Fix:** If you get CORS errors, restart the server using `restart-server.bat` or `restart-server.ps1`

3. **Database connection issues:**
   - Make sure MongoDB is running
   - Check your MONGODB_URI in the .env file
   - Verify network connectivity

4. **CORS Issues:**
   - The server is configured to allow requests from `http://localhost:5173` and `http://localhost:5174`
   - If your frontend runs on a different port, restart the server to apply CORS changes

### Error Messages

- **"User with this email already exists"** - Email is already registered
- **"Invalid credentials"** - Wrong email or password
- **"Account is deactivated"** - User account has been deactivated by admin

## Security Features

- **Password Hashing:** All passwords are hashed using bcrypt
- **JWT Tokens:** Secure token-based authentication
- **Rate Limiting:** API endpoints are rate-limited to prevent abuse
- **CORS Protection:** Configured to allow only specific origins
- **Input Validation:** All user inputs are validated and sanitized

## Development

To modify the authentication system:

1. **Server changes:** Edit files in `dashboard-electricity/server/src/`
2. **Frontend changes:** Edit files in `electricity-website/src/context/AuthContext.tsx`
3. **Database changes:** Modify the User model in `dashboard-electricity/server/src/models/User.js`

## API Documentation

For detailed API documentation, see the server routes in `dashboard-electricity/server/src/routes/auth.js`. 
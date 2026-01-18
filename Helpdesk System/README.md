# Helpdesk System

A modern, full-stack helpdesk ticketing system built with Node.js, Express, MySQL, and Socket.io. This application provides a comprehensive platform for managing support tickets, user profiles, and task workflows with real-time communication capabilities.

## Features

### Core Functionality
- **User Authentication**: Secure login and registration system with bcrypt password hashing
- **Ticket Management**: Create, edit, and manage support tickets with modal-based interactions
- **Real-time Updates**: WebSocket support via Socket.io for instant notifications
- **File Uploads**: Support for attaching files to tickets and profiles
- **User Dashboard**: Personalized dashboard with task summaries and activity tracking
- **Profile Management**: User profile editing with file upload capabilities
- **Rate Limiting**: Built-in protection against brute force attacks

### Security Features
- **Session Management**: Secure HTTP-only sessions with configurable expiration
- **Password Hashing**: bcrypt-based password encryption
- **Input Validation**: Validator library for input sanitization
- **CSRF Protection**: Strict cookie policies and same-site cookies
- **Rate Limiting**: Express rate limiter to prevent abuse

## Technology Stack

### Backend
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js
- **Database**: MySQL 2
- **Authentication**: bcrypt
- **Real-time Communication**: Socket.io
- **File Handling**: Multer
- **Task Scheduling**: node-cron

### Frontend
- **HTML5/CSS3**: Custom styling for each page
- **JavaScript**: Vanilla JS with Socket.io client
- **Styling**: Custom CSS with responsive design

### Development
- **Hot Reload**: Nodemon for development
- **Live Reload**: Connect-livereload for automatic page refresh
- **Port Management**: Portfinder for automatic port detection

## Project Structure

```
login-helpdesk/
├── app.js                 # Main application entry point
├── dbSetup.js            # Database initialization
├── functions-app.js      # Application functions and utilities
├── package.json          # Project dependencies
├── internal/             # Internal application files
│   ├── common.js         # Shared utilities
│   ├── global.css        # Global styles
│   ├── protected/        # Authenticated routes
│   │   ├── taskModal.html
│   │   ├── taskEditModal.html
│   │   ├── dashboard/    # Dashboard module
│   │   ├── profile/      # User profile module
│   │   └── summary/      # Summary/reports module
│   └── public/           # Public routes
│       ├── login/        # Login page
│       ├── register/     # Registration page
│       └── welcome/      # Welcome/landing page
├── uploads/              # User file uploads directory
└── README.md            # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd login-helpdesk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the project root:
   ```
   DATABASE_HOST=localhost
   DATABASE_USER=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=helpdesk_db
   SESSION_SECRET=your_session_secret_key
   COOKIE_SECURE=false  # Set to true in production with HTTPS
   PORT=3000
   ```

4. **Initialize the database**
   ```bash
   node dbSetup.js
   ```

5. **Start the application**
   
   Development mode with hot reload:
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   node app.js
   ```

The application will be available at `http://localhost:3000`

## Usage

### For Users
1. **Register**: Create a new account on the registration page
2. **Login**: Use your credentials to access the system
3. **Dashboard**: View your tickets and task summary
4. **Create Ticket**: Click "New Task" to create a support ticket
5. **Edit Ticket**: Click on existing tickets to edit or update status
6. **Profile**: View and edit your user profile
7. **Summary**: Check task statistics and reports

### For Administrators
- Access the database directly via MySQL for system administration
- Scheduled tasks run automatically via node-cron
- Monitor active sessions and user activity

## API Endpoints

### Authentication Routes
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /logout` - Logout user

### Protected Routes (Authenticated Users)
- `GET /dashboard` - Dashboard page
- `GET /profile` - User profile page
- `GET /summary` - Task summary page
- `POST /task` - Create a new task
- `PUT /task/:id` - Update a task
- `GET /task/:id` - Get task details

### File Upload
- `POST /upload` - Upload files (handled by Multer)

## Dependencies

### Production Dependencies
- **express** - Web framework
- **mysql2** - MySQL database driver
- **bcrypt** - Password hashing
- **express-session** - Session management
- **socket.io** - Real-time bidirectional communication
- **multer** - File upload handling
- **validator** - Input validation and sanitization
- **express-rate-limit** - Rate limiting middleware
- **node-cron** - Task scheduling
- **dotenv** - Environment variable management
- **connect-livereload** - Live reload support
- **portfinder** - Automatic port detection

### Development Dependencies
- **nodemon** - Auto-restart on file changes

## Security Considerations

1. **Environment Variables**: Never commit `.env` file to version control
2. **HTTPS**: Set `COOKIE_SECURE=true` when deploying with HTTPS
3. **Session Secret**: Use a strong, random SESSION_SECRET
4. **Rate Limiting**: Applied to prevent brute force attacks
5. **SQL Injection**: Use parameterized queries (ensure in functions-app.js)
6. **File Uploads**: Validate file types and sizes in production

## Troubleshooting

### Port Already in Use
The application uses `portfinder` to automatically find an available port if the default is in use.

### Database Connection Issues
- Verify MySQL is running
- Check `.env` database credentials
- Ensure database exists and tables are initialized

### Session/Cookie Issues
- Clear browser cookies and cache
- Verify SESSION_SECRET is set in `.env`
- Check COOKIE_SECURE setting matches your protocol (HTTP/HTTPS)

### File Upload Issues
- Ensure `/uploads` directory exists and is writable
- Check file size limits in Multer configuration

## Development

### Watch Mode
```bash
nodemon app.js
```

### Live Reload
Connect-livereload is configured to auto-refresh the browser during development.

### Database Setup
Run the database initialization script:
```bash
node dbSetup.js
```

**Last Updated**: January 2026

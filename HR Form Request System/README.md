# HR Form Request System

A comprehensive full-stack application for managing HR form requests, employee approvals, and travel bookings. This system streamlines the process of submitting, approving, and tracking various HR-related forms including flight requests, booking details, and departmental approvals.

## Features

### Core Functionality
- **User Authentication & Authorization**: Secure login system with role-based access control
- **Form Management**: Create, edit, and submit various HR forms (Flight Requests, Booking Details, etc.)
- **Approval Workflow**: Multi-level approval process with status tracking
- **Travel Request Management**: Comprehensive flight booking and travel request handling
- **User Profiles**: Complete user profile management with credentials
- **Department Management**: Organize users and requests by departments
- **Notifications**: Real-time notifications for form submissions and approvals
- **Progress Updates**: Track progress on submitted requests
- **Role-Based Access**: Different permission levels for users, approvers, and admins

### Additional Features
- **Flier Management**: Manage flight and travel information
- **Status Tracking**: Multiple status types for different request stages
- **Purpose of Travel**: Categorize travel requests by purpose
- **Audit Trail**: Progress updates and status history for all requests

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **ORM**: Sequelize (SQL Database)
- **Authentication**: JWT/Session-based
- **Validation**: Custom validators
- **View Engine**: Jade/Pug (for server-rendered pages)

### Frontend
- **Framework**: React.js
- **State Management**: React Context API
- **HTTP Client**: TanStack React Query (React Query)
- **Styling**: SCSS/CSS
- **Build Tool**: Create React App (Webpack)
- **Development Tools**: React Query DevTools

### Database
- **Type**: SQL Database (MySQL via Sequelize)
- **Relationships**: Complex relational models for HR management

## Project Structure

### Backend Structure

```
Backend/app/
├── constants/
│   ├── database/        # Database constants
│   └── http/            # HTTP status constants
├── controllers/         # Business logic handlers
│   ├── approver/        # Approval management
│   ├── auth/            # Authentication
│   ├── booking_details/ # Booking information
│   ├── department/      # Department management
│   ├── flier/           # Flight information
│   ├── flight_request/  # Flight request handling
│   ├── form_type/       # Form type definitions
│   ├── notification/    # Notifications
│   ├── progress_update/ # Progress tracking
│   ├── purpose_of_travel/
│   ├── request/         # General request handling
│   ├── role/            # Role management
│   ├── status_type/     # Status definitions
│   ├── user_account/    # User accounts
│   ├── user_credentials/# User login credentials
│   └── user_profile/    # User profiles
├── core/
│   └── validator.js     # Validation utilities
├── middlewares/
│   └── auth/            # Authentication middleware
├── models/              # Sequelize models
│   ├── approver.js
│   ├── booking_details.js
│   ├── department.js
│   ├── flier.js
│   ├── flight_request.js
│   ├── form_type.js
│   ├── notification.js
│   ├── progress_update.js
│   ├── purpose_of_travel.js
│   ├── request.js
│   ├── role.js
│   ├── status_type.js
│   ├── user_account.js
│   ├── user_credentials.js
│   ├── user_profile.js
│   ├── index.js         # Model initialization
│   └── helpers/         # Model helper functions
├── routes/              # API routes
│   ├── approver/
│   ├── booking_details/
│   ├── department/
│   ├── flier/
│   ├── flight_request/
│   ├── form_type/
│   ├── notification/
│   ├── progress_update/
│   ├── purpose_of_travel/
│   ├── request/
│   ├── role/
│   ├── status_type/
│   ├── user_account/
│   ├── user_credentials/
│   ├── user_profile/
│   ├── route_template.js
│   └── routes.js        # Route aggregation
├── schemas/             # Request validation schemas
│   ├── (corresponding to controllers)
│   ├── schema_template.js
│   └── timestamp/
├── services/
│   ├── token/           # JWT/Session token services
│   └── upload_service/  # File upload handling
├── views/               # Server-rendered templates
│   ├── error.jade
│   └── layout.jade
└── config/
    └── database.js      # Database configuration
```

### Frontend Structure

```
Frontend/
├── public/
│   ├── index.html       # Entry HTML
│   ├── manifest.json    # PWA manifest
│   └── robots.txt
└── src/
    ├── App.js           # Main component
    ├── App.scss         # Main styles
    ├── index.js         # React entry point
    ├── index.scss       # Global styles
    ├── api/             # API clients
    │   ├── ApproverAPI.js
    │   ├── Auth.js
    │   ├── Base.js
    │   ├── BookingDetailsAPI.js
    │   ├── DepartmentAPI.js
    │   ├── FlierAPI.js
    │   ├── FlightRequestAPI.js
    │   ├── FormTypeAPI.js
    │   ├── NotificationAPI.js
    │   ├── ProgressUpdateAPI.js
    │   ├── PurposeOfTravelAPI.js
    │   ├── RequestAPI.js
    │   ├── RoleAPI.js
    │   ├── StatusTypeAPI.js
    │   ├── UserCredentialsAPI.js
    │   └── UserProfileAPI.js
    ├── assets/
    │   └── ErrorImages/
    ├── components/      # Reusable components
    │   ├── BookingForm.js
    │   ├── Callout.jsx
    │   └── (other components)
    ├── context/         # React Context providers
    ├── pages/           # Page components
    ├── routes/          # Route definitions
    ├── queryFunctions/  # React Query hooks
    └── setupTests.js    # Test configuration
```

## Usage Guide

### For Employees
1. **Register/Login**: Create account or login with credentials
2. **Access Dashboard**: View submitted forms and status
3. **Submit Form**: Create new HR request (Flight, Booking, etc.)
4. **Track Request**: Monitor approval status and progress
5. **View Notifications**: Check updates on requests
6. **Manage Profile**: Update personal information

### For Approvers
1. **Login**: Access approver account
2. **View Pending Requests**: See forms awaiting approval
3. **Approve/Reject**: Take action on submitted requests
4. **Add Comments**: Provide feedback via progress updates
5. **Track Approvals**: Monitor approval workflow

### For Administrators
1. **User Management**: Create/manage user accounts and roles
2. **Department Management**: Organize departments
3. **Form Configuration**: Set up form types and statuses
4. **Approval Chain**: Configure approvers for departments
5. **View Reports**: Access system-wide analytics

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `GET /api/user-profiles/:id` - Get user profile
- `PUT /api/user-profiles/:id` - Update user profile

### Requests
- `GET /api/requests` - List all requests
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get request details
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request

### Flight Requests
- `GET /api/flight-requests` - List flight requests
- `POST /api/flight-requests` - Create flight request
- `PUT /api/flight-requests/:id` - Update flight request

### Approvers
- `GET /api/approvers` - List approvers
- `POST /api/approvers/:requestId` - Approve request
- `PUT /api/approvers/:id` - Update approver details

### Other Resources
- `GET /api/departments` - List departments
- `GET /api/roles` - List roles
- `GET /api/status-types` - List status types
- `GET /api/form-types` - List form types
- `GET /api/purpose-of-travel` - List travel purposes
- `GET /api/notifications` - Get user notifications
- `GET /api/progress-updates/:requestId` - Get request progress

## Database Schema

The system uses Sequelize ORM with the following key entities:

### Core Models
- **UserAccount**: User login information and account status
- **UserProfile**: Extended user information (name, contact, etc.)
- **Department**: Organizational departments
- **Role**: User roles and permissions

### Request Management
- **Request**: Base form request entity
- **FlightRequest**: Specific flight booking requests
- **BookingDetails**: Flight and hotel booking information
- **FormType**: Types of available forms
- **StatusType**: Request status definitions

### Approval Process
- **Approver**: Approval workflow and permissions
- **ProgressUpdate**: Track request progress and comments
- **Notification**: System notifications

### Reference Data
- **Flier**: Flight information
- **PurposeOfTravel**: Travel purpose categories
- **UserCredentials**: Login credentials management

### Code Structure Best Practices
- Controllers handle business logic
- Models define database schema
- Routes handle HTTP endpoints
- Middleware handles cross-cutting concerns (auth, validation)
- Services handle reusable business logic
- API clients (frontend) handle server communication

## Security Features

1. **Authentication**: Secure user authentication
2. **Authorization**: Role-based access control (RBAC)
3. **Input Validation**: Validation at API level
4. **Password Security**: Encrypted password storage
5. **Session Management**: Secure session handling
6. **CORS**: Cross-Origin Resource Sharing configuration

**Last Updated**: January 2026


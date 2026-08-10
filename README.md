# Workshop Management System

## Overview
The Workshop Management System is a comprehensive, full-stack application designed to streamline the administration of technical and non-technical workshops. Built to handle complex entity relationships, the system provides an intuitive interface for staff and administrators to create and manage workshops, oversee participant registrations, and handle day-of check-in operations.

The platform is designed with scalability and data integrity in mind, utilizing strict relational database constraints, transactional boundaries to prevent race conditions during registration, and role-based access control (Admin, Staff, Viewer) to ensure secure operations.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** MySQL (mysql2), utilizing robust foreign keys and ACID transactions
- **Authentication:** JSON Web Tokens (JWT) with secure HTTP-only refresh token rotation
- **File Handling:** Multer (for CSV parsing and image uploads)
- **Frontend:** React.js, Vite, React Router, React Hook Form, Yup

## Local Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server (v8 or higher)

### Database Configuration
1. Start your local MySQL server.
2. Create a new database (e.g., `workshop_management`).
3. Run the schema creation queries to initialize the tables.

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies by running `npm install`.
3. Duplicate `.env.example` and rename it to `.env`. Update the variables with your local database credentials and desired JWT secrets.
4. Start the backend server by running `npm run dev`. The server will typically run on port 3000.

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies by running `npm install`.
3. Start the development server by running `npm run dev`. The application will typically be accessible on port 5173.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate a user and receive tokens
- `GET /api/auth/me` - Retrieve current authenticated user profile
- `POST /api/auth/refresh` - Refresh access token via secure cookie
- `POST /api/auth/logout` - Invalidate current session

### Workshops
- `GET /api/workshops` - List all workshops (supports search, status, and phase filtering)
- `GET /api/workshops/:id` - Retrieve a specific workshop by ID
- `POST /api/workshops` - Create a new workshop
- `PATCH /api/workshops/:id` - Update an existing workshop
- `PATCH /api/workshops/:id/status` - Update the operational status of a workshop
- `PATCH /api/workshops/:id/banner` - Upload a promotional banner image
- `DELETE /api/workshops/:id` - Remove a workshop

### Participants
- `GET /api/participants` - List participants with optional pagination and filtering
- `GET /api/participants/:id` - Retrieve a specific participant
- `POST /api/participants` - Create a new participant (and optionally register them for a workshop)
- `POST /api/participants/import` - Bulk import participants via CSV
- `PATCH /api/participants/:id` - Update participant details
- `DELETE /api/participants/:id` - Remove a participant

### Registrations
- `GET /api/registrations` - List registrations
- `GET /api/registrations/:id` - Retrieve a specific registration
- `POST /api/registrations` - Register an existing participant for a workshop
- `PATCH /api/registrations/:id/status` - Update registration status (e.g., waitlisted, registered)
- `PATCH /api/registrations/:id/cancel` - Cancel a registration
- `DELETE /api/registrations/:id` - Delete a registration record

### Check-ins
- `POST /api/checkins/workshop/:workshop_id` - Process a participant check-in via registration code
- `GET /api/checkins/workshop/:workshop_id` - Retrieve check-in history for a specific workshop
- `PATCH /api/checkins/:id/checkout` - Process a participant check-out

### Announcements
- `GET /api/announcements/workshop/:workshop_id` - Retrieve all announcements for a workshop
- `POST /api/announcements/workshop/:workshop_id` - Create a new announcement

### Reports & Dashboards
- `GET /api/dashboard/stats` - Retrieve aggregate system statistics
- `GET /api/reports/workshop/:workshop_id/export` - Export workshop registrations as a CSV report

# Quiz Application API

A Node.js REST API with user management, categories, and multiple-choice questions.

## Features

- User authentication with email verification
- User profile management with profile picture
- Category management
- Multiple-choice questions with multiple categories
- Bulk question import via CSV
- Answer submission and tracking
- Question search with user answers

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/quiz_app
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   BASE_URL=http://localhost:3000
   ```
4. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Users
- POST `/api/users/signup` - Register a new user
- GET `/api/users/verify/:token` - Verify email address
- POST `/api/users/login` - User login
- GET `/api/users/profile` - Get user profile
- PATCH `/api/users/profile` - Update user profile (supports multipart/form-data for profile picture)

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories/with-count` - Get all categories with question counts
- POST `/api/categories` - Create a new category

### Questions
- GET `/api/questions/category/:categoryId` - Get questions by category
- POST `/api/questions/import` - Import questions from CSV
- POST `/api/questions/:questionId/answer` - Submit an answer
- GET `/api/questions/search?query=text` - Search questions with user answers

## CSV Format for Question Import

The CSV file should have the following columns:
- text: The question text
- options: Pipe-separated options with semicolon-separated correct flag (e.g., "Option 1;true|Option 2;false")
- categories: Pipe-separated category IDs

Example:
```csv
text,options,categories
"What is Node.js?","A runtime environment;true|A programming language;false|A database;false","categoryId1|categoryId2"
```

## Authentication

Include the JWT token in the Authorization header for protected routes:
```
Authorization: Bearer your_jwt_token
```#   n o d e - m a c h i n e - r o u n d - a s s i g n m e n t  
 
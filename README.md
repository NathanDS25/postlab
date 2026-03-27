# Student & Movie Records Management System

A full-stack REST API application for managing student and movie records with a React frontend.

## Project Structure

```
postlab/
├── backend/
│   ├── server.js          # Express.js server with all endpoints
│   └── package.json       # Node.js dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── StudentManager.js
│   │   │   ├── StudentManager.css
│   │   │   ├── MovieManager.js
│   │   │   └── MovieManager.css
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json       # React dependencies
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   Frontend will open at `http://localhost:3000`

## API Endpoints

### Student Endpoints
- **GET** `/students` - Get all students
- **GET** `/students/:id` - Get a specific student
- **POST** `/students` - Create a new student
- **PUT** `/students/:id` - Update a student
- **DELETE** `/students/:id` - Delete a student

### Movie Endpoints
- **GET** `/movies` - Get all movies
- **GET** `/movies?rating=4` - Filter movies by rating
- **POST** `/movies` - Create a new movie
- **PATCH** `/movies/:id` - Update a movie (partial update)
- **DELETE** `/movies/:id` - Delete a movie

## Data Models

### Student
```json
{
  "id": 1,
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "grade": "A"
}
```

### Movie
```json
{
  "id": 1,
  "title": "Inception",
  "genre": "Sci-Fi",
  "rating": 5,
  "recommendation": "Yes"
}
```

## Testing with Postman

See [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) for detailed instructions on how to test the API with Postman and add custom JavaScript.

## Features

- ✅ RESTful API design
- ✅ CRUD operations for students and movies
- ✅ Filter movies by rating
- ✅ React frontend with tab-based UI
- ✅ Real-time data sync between frontend and backend
- ✅ Responsive design
- ✅ Error handling and validation

## Usage

### Using the React Frontend
1. Click on the "Students" or "Movies" tab
2. Fill in the form to add new records
3. Click "Edit" to modify existing records
4. Click "Delete" to remove records
5. For movies, use the rating filter dropdown to filter by rating

### Using Postman (See detailed guide below)
Postman allows you to test all API endpoints directly.

---

For Postman integration guide, see POSTMAN_GUIDE.md

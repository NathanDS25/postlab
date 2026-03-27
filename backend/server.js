const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../frontend/public/images');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, '../frontend/public/images')));

// In-memory data storage
let students = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', grade: 'A' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', grade: 'B' },
  { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', grade: 'A' }
];

let movies = [
  { id: 1, title: 'Inception', genre: 'Sci-Fi', rating: 5, recommendation: 'Yes', poster: 'inception.jpg' },
  { id: 2, title: 'The Dark Knight', genre: 'Action', rating: 5, recommendation: 'Yes', poster: 'dark-knight.jpg' },
  { id: 3, title: 'Interstellar', genre: 'Sci-Fi', rating: 4, recommendation: 'Yes', poster: 'interstellar.jpg' },
  { id: 4, title: 'Titanic', genre: 'Drama', rating: 4, recommendation: 'Yes', poster: 'titanic.jpg' },
  { id: 5, title: 'The Room', genre: 'Drama', rating: 1, recommendation: 'No', poster: 'the-room.jpg' }
];

let nextStudentId = 4;
let nextMovieId = 6;

// ==================== IMAGE UPLOAD ENDPOINT ====================
app.post('/movies/upload', upload.single('poster'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }
    res.json({
      filename: req.file.filename,
      path: `/images/${req.file.filename}`,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STUDENT ENDPOINTS ====================

app.get('/students', (req, res) => {
  res.json(students);
});

app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

app.post('/students', (req, res) => {
  const { name, email, grade } = req.body;
  if (!name || !email || !grade) {
    return res.status(400).json({ message: 'Name, email, and grade are required' });
  }
  const newStudent = { id: nextStudentId++, name, email, grade };
  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }
  Object.assign(student, req.body);
  res.json(student);
});

app.delete('/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Student not found' });
  }
  const deletedStudent = students.splice(index, 1);
  res.json(deletedStudent);
});

// ==================== MOVIE ENDPOINTS ====================

app.get('/movies', (req, res) => {
  const { rating } = req.query;
  if (rating) {
    const filteredMovies = movies.filter(m => m.rating === parseInt(rating));
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.post('/movies', (req, res) => {
  const { title, genre, rating, recommendation, poster } = req.body;
  if (!title || !genre || rating === undefined || !recommendation) {
    return res.status(400).json({ message: 'Title, genre, rating, and recommendation are required' });
  }
  const newMovie = { 
    id: nextMovieId++, 
    title, 
    genre, 
    rating: parseInt(rating), 
    recommendation, 
    poster: poster || null 
  };
  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.patch('/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id === parseInt(req.params.id));
  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  Object.assign(movie, req.body);
  res.json(movie);
});

app.delete('/movies/:id', (req, res) => {
  const index = movies.findIndex(m => m.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  const deletedMovie = movies.splice(index, 1);
  res.json(deletedMovie);
});

// ==================== ROOT ENDPOINT ====================

app.get('/', (req, res) => {
  res.json({
    message: 'Student & Movie Records API with Image Upload',
    endpoints: {
      students: [
        'GET /students',
        'GET /students/:id',
        'POST /students',
        'PUT /students/:id',
        'DELETE /students/:id'
      ],
      movies: [
        'GET /movies',
        'GET /movies?rating=4',
        'POST /movies',
        'POST /movies/upload (multipart/form-data)',
        'PATCH /movies/:id',
        'DELETE /movies/:id'
      ],
      static: [
        'GET /images/:filename'
      ]
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}`);
  console.log(`Image uploads: POST /movies/upload`);
});


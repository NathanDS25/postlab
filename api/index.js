const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// In-memory data storage (Volatile in Serverless)
let movies = [
  { id: 1, title: 'Inception', genre: 'Sci-Fi', rating: 5, recommendation: 'Yes', poster: 'inception.jpg' },
  { id: 2, title: 'The Dark Knight', genre: 'Action', rating: 5, recommendation: 'Yes', poster: 'dark-knight.jpg' },
  { id: 3, title: 'Interstellar', genre: 'Sci-Fi', rating: 4, recommendation: 'Yes', poster: 'interstellar.jpg' },
  { id: 4, title: 'Titanic', genre: 'Drama', rating: 4, recommendation: 'Yes', poster: 'titanic.jpg' },
  { id: 5, title: 'The Room', genre: 'Drama', rating: 1, recommendation: 'No', poster: 'the-room.jpg' }
];

let nextMovieId = 6;

// Middleware
app.use(cors());
app.use(bodyParser.json());

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

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'CineHub API is Live on Vercel' });
});

module.exports = app;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const apicache = require('apicache');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(compression()); // Compress all responses
app.use(express.json());

// API Cache for GET requests (5 minutes)
const cache = apicache.middleware;
app.use('/api', (req, res, next) => {
  if (req.method === 'GET') {
    return cache('5 minutes')(req, res, next);
  }
  next();
});

// Health check
app.get('/', (req, res) => res.json({ message: 'Vet Clinic API is running ✅' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/owners', require('./routes/owners'));
app.use('/api/cows', require('./routes/cows'));
app.use('/api/visits', require('./routes/visits'));
app.use('/api/billing', require('./routes/billing'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

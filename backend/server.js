require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = async () => {
  const cdb = require('./config/db');
  await cdb();
};

const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for the assessment to prevent any deployment port block issues
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Base route for deployment health checks
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'AI Travel Planner Backend API is operating normally.',
    version: '1.0.0'
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred',
    message: err.message
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

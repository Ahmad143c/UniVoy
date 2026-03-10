const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// allow overriding the frontend origin via env var (useful in Codespaces and production)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
app.set('io', io);

// CORS configuration
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection Options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, options)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the frontend's public directory
app.use(express.static(path.join(__dirname, '../univoy-frontend/public')));

// Serve static files from the frontend's assets directory
app.use('/assets', express.static(path.join(__dirname, '../univoy-frontend/src/assets')));

// Serve static files from the frontend's images directory
app.use('/assets/images', express.static(path.join(__dirname, '../univoy-frontend/src/assets/images')));

// Routes
app.use('/api/courses', require('./routes/courses'));
app.use('/api/course-applications', require('./routes/courseApplications'));
app.use('/api/students', require('./routes/students'));
app.use('/api/auth', require('./routes/auth'));
const uploadRoutes = require('./routes/uploads');
app.use('/api/files', uploadRoutes);
app.use('/files', uploadRoutes); // <-- Ensure this is before the 404 handler
app.use('/api/consultants', require('./routes/consultants'));
app.use('/api/users', require('./routes/users'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/feedback', require('./routes/feedback'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to UniVoy API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server with error handling
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port or kill the process using this port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
    process.exit(1);
  }
}); 
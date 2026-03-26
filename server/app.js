const express = require('express');
const cors = require('cors');

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS middleware BEFORE routes
app.use(cors({
    origin: "http://127.0.0.1:5500",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type"
}));

// Import API routes
const studentRoutes = require('./routes/studentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const resultRoutes = require('./routes/resultRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Mount routes
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/analytics', analyticsRoutes);

module.exports = app;

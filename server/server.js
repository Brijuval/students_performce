const express = require('express');
const connectDB = require('../config/database');
const cors = require('cors');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS middleware BEFORE routes
app.use(cors({
    origin: "http://127.0.0.1:5500",
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type"
}));

// Connect to MongoDB
connectDB();

// Import API routes
const studentRoutes = require('./routes/studentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const resultRoutes = require('./routes/resultRoutes');
const analyticsRoutes = require("./routes/analyticsRoutes"); // Import analyticsRoutes
const cgpa = require('./routes/cgpa');

// Optional: Log the type of imported routes for debugging
console.log(
    'studentRoutes:', typeof studentRoutes,
    'subjectRoutes:', typeof subjectRoutes,
    'resultRoutes:', typeof resultRoutes,
    'analyticsRoutes:', typeof analyticsRoutes
);

// Use the imported routes as middleware - studentRoutes FIRST
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/cgpa', cgpa);


// Then mount analyticsRoutes
app.use("/api/analytics", analyticsRoutes);

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
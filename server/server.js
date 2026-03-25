const connectDB = require('../config/database');
const app = require('./app');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
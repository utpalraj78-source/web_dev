const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const bookRoutes = require('./routes/bookRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/book_management', {
  serverSelectionTimeoutMS: 5000, 
})
.then(() => console.log('MongoDB connection established successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/books', bookRoutes);

// Fallback for unhandled routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./controllers/auth');
const bookRoutes = require('./controllers/books');

const app = express();

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/auth', authRoutes);   // Authentication Routes
app.use('/books', bookRoutes);  // Book Routes

app.listen(4000, () => {
  console.log('Server running');
});

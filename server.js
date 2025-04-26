require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');

// Import routes and models
const authRoutes = require('./routes/authRoutes');
const booksRoutes = require('./routes/books');
const studentsRoutes = require('./routes/students');
const loansRoutes = require('./routes/loans');
const isAuthenticated = require('./middleware/auth');
const Book = require('./models/Book'); // Required for test-query

const app = express();

// Database Connection Logic
const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: false,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  };

  if (isProduction) {
    // Production (Cosmos DB) configuration
    options.authMechanism = 'SCRAM-SHA-256';
    options.authSource = 'admin';
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`✅ Connected to ${isProduction ? 'Cosmos DB (Production)' : 'Local MongoDB'}`);
    
    // Verify indexes in development
    if (!isProduction) {
      await mongoose.model('Book').syncIndexes();
      await mongoose.model('Student').syncIndexes();
      await mongoose.model('Loan').syncIndexes();
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
};

// Connection event handlers
mongoose.connection.on('error', err => {
  console.error('🚨 DB Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ DB Disconnected! Attempting to reconnect...');
  setTimeout(connectDB, 5000);
});

// Initialize DB connection
connectDB();

// Middleware & View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'library-management-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 } // 1 hour
}));
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

// Authentication routes (accessible without authentication)
app.use('/', authRoutes);

// Test routes (unprotected)
app.get('/testdb', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.send(`✅ Database connected successfully! (${process.env.NODE_ENV || 'development'} mode)`);
  } catch (err) {
    res.status(500).send(`❌ Database error: ${err.message}`);
  }
});

app.get('/test-query', async (req, res) => {
  try {
    const simpleBooks = await Book.find({}).limit(5);
    res.json({
      status: 'success',
      books: simpleBooks,
      connection: process.env.NODE_ENV === 'production' ? 'Cosmos DB' : 'Local MongoDB'
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      hint: process.env.NODE_ENV === 'production' ? 
        'Check Cosmos DB indexes and query compatibility' : 
        'Check local MongoDB connection'
    });
  }
});

// Protected root route
app.get('/', isAuthenticated, (req, res) => {
  res.render('index', { 
    title: 'Library Management System',
    environment: process.env.NODE_ENV || 'development',
    user: req.session.user
  });
});

// Protected routes
app.use('/books', isAuthenticated, booksRoutes);
app.use('/students', isAuthenticated, studentsRoutes);
app.use('/loans', isAuthenticated, loansRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    user: req.session.user
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).render('error', {
    title: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err : null,
    user: req.session.user
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB URI: ${process.env.MONGO_URI?.split('@')[0]}*****@${process.env.MONGO_URI?.split('@')[1]}`);
});

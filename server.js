// Load environment variables
require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const mongoose = require('mongoose');

// Import database connection
const { connectDB } = require('./src/server/config/database');

// Import routes
const pagesRouter = require('./src/server/routes/pages.routes');
const apiRouter = require('./src/server/routes/api.routes');
const adminRouter = require('./src/server/routes/admin.routes');
const authRouter = require('./src/server/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout-full');

// Middleware
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database and start server
async function startServer() {
  try {
    // Connect to MongoDB FIRST
    await connectDB();

    // ========== SESSION & PASSPORT SETUP (AFTER DB CONNECTION) ==========
    app.use(session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        touchAfter: 24 * 3600 // lazy update (24 hours)
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      }
    }));

    // Import passport AFTER session is configured
    const passport = require('./src/server/config/passport');
    
    // Initialize Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Make user available in all views
    app.use((req, res, next) => {
      res.locals.currentUser = req.user || null;
      next();
    });
    // ========== END SESSION & PASSPORT SETUP ==========

    // Routes
    app.use('/', pagesRouter);
    app.use('/api', apiRouter);
    app.use('/auth', authRouter);
    app.use('/admin', adminRouter);

    // Error handling middleware
    app.use((req, res) => {
      if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'Not found' });
      } else {
        res.locals.layout = 'layouts/layout-full';
        res.status(404).render('404', {
          title: '404 - Not Found'
        });
      }
    });

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the application
startServer();
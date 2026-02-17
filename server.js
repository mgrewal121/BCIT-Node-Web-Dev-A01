const express = require('express');
const morgan = require('morgan');
const path = require('path');

const pagesRouter = require('./src/server/routes/pages.routes');
const apiRouter = require('./src/server/routes/api.routes');


const app = express();
const PORT = process.env.PORT || 3000;
const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout', 'layouts/layout-full'); // Default layout for all views

// Middleware
app.use(morgan('dev'));
// Gets static files from the public folder
app.use(express.static('public'));
app.use(express.json());

// Parses URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', pagesRouter);
app.use('/api', apiRouter);

// Error handling middleware
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Not found' });
  } else {
    res.status(404).render('404', {
      title: '404 - Not Found',
      layout: 'layouts/layout-full'
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
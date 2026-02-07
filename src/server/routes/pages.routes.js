const express = require('express');
const path = require('path');
const router = express.Router();

const pagesDir = path.join(__dirname, '../../pages');

// Page routes
router.get('/', (req, res) => {
  res.sendFile(path.join(pagesDir, 'index.html'));
});

router.get('/about', (req, res) => {
  res.sendFile(path.join(pagesDir, 'about.html'));
});

router.get('/projects', (req, res) => {
  res.sendFile(path.join(pagesDir, 'projects.html'));
});

router.get('/contact', (req, res) => {
  res.sendFile(path.join(pagesDir, 'contact.html'));
});

// Submission route for contact form
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email, and message.'
    });
  }

  console.log('Contact form submission:', { name, email, message });

  // Success!
  res.status(200).json({
    success: true,
    message: `Thank you, ${name}! We have received your message.`
  });
});

module.exports = router;
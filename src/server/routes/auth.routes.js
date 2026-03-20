/* CLAUDE GENERATED FILE */

const express = require('express');
const router = express.Router();
const passport = require('passport');
const { User } = require('../models');

/**
 * GET /auth/login
 * Render login page
 */
router.get('/login', (req, res) => {
  // Redirect if already logged in
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  res.locals.layout = 'layouts/layout-full';
  res.render('auth/login', {
    title: 'Login',
    error: req.query.error || null
  });
});

/**
 * POST /auth/login
 * Handle login submission
 */
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect('/auth/login?error=' + encodeURIComponent(info.message || 'Login failed'));
    }

    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }

      // Redirect based on role
      if (user.role === 'ADMIN' || user.role === 'MODERATOR') {
        return res.redirect('/admin');
      } else {
        return res.redirect('/');
      }
    });
  })(req, res, next);
});

/**
 * GET /auth/register
 * Render registration page
 */
router.get('/register', (req, res) => {
  // Redirect if already logged in
  if (req.isAuthenticated()) {
    return res.redirect('/admin');
  }

  res.locals.layout = 'layouts/layout-full';
  res.render('auth/register', {
    title: 'Register',
    error: null
  });
});

/**
 * POST /auth/register
 * Handle registration submission
 */
router.post('/register', async (req, res) => {
  try {
    const { email, nickname, password, confirmPassword } = req.body;

    // Validation
    if (!email || !nickname || !password || !confirmPassword) {
      res.locals.layout = 'layouts/layout-full';
      return res.render('auth/register', {
        title: 'Register',
        error: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      res.locals.layout = 'layouts/layout-full';
      return res.render('auth/register', {
        title: 'Register',
        error: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      res.locals.layout = 'layouts/layout-full';
      return res.render('auth/register', {
        title: 'Register',
        error: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.locals.layout = 'layouts/layout-full';
      return res.render('auth/register', {
        title: 'Register',
        error: 'Email already registered'
      });
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      nickname,
      passwordHash: password,
      role: 'USER'
    });

    // Auto-login after registration
    req.logIn(user, (err) => {
      if (err) {
        console.error('Error logging in after registration:', err);
        return res.redirect('/auth/login');
      }
      res.redirect('/');
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.locals.layout = 'layouts/layout-full';
    res.render('auth/register', {
      title: 'Register',
      error: 'Registration failed. Please try again.'
    });
  }
});

/**
 * POST /auth/logout
 * Handle logout
 */
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

/**
 * GET /auth/logout
 */
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

module.exports = router;
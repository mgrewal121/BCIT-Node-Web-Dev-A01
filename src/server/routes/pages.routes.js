const express = require('express');
const router = express.Router();
const projectsRepo = require('../lib/projects.repository');
const { Contact } = require('../models');

/**
 * GET /
 * Home page
 */
router.get('/', (req, res) => {
  res.locals.layout = 'layouts/layout-full';
  res.render('index', {
    title: 'Home'
  });
});

/**
 * GET /about
 * About page
 */
router.get('/about', (req, res) => {
  res.locals.layout = 'layouts/layout-full';
  res.render('about', {
    title: 'About'
  });
});

/**
 * GET /projects
 * Projects listing page with optional search
 */
router.get('/projects', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const tagFilter = req.query.tag || '';
    const projects = await projectsRepo.getActiveProjects(searchTerm, tagFilter);

    res.locals.layout = 'layouts/layout-full';
    res.render('projects', {
      title: 'Projects',
      projects,
      searchTerm,
      tagFilter
    });
  } catch (error) {
    console.error('Error loading projects:', error);
    res.status(500).send('Error loading projects');
  }
});

// GET by category slug
router.get('/projects/category/:slug', async (req, res) => {
  try {
    const { Category } = require('../models');
    const category = await Category.findOne({ slug: req.params.slug }).lean();
    
    if (!category) {
      res.locals.layout = 'layouts/layout-full';
      return res.status(404).render('404', {
        title: '404 - Not Found'
      });
    }

    const projects = await projectsRepo.getProjectsByCategory(req.params.slug);

    res.locals.layout = 'layouts/layout-full';
    res.render('projects', {
      title: `${category.name} Projects`,
      projects,
      searchTerm: '',
      tagFilter: '',
      category
    });
  } catch (error) {
    console.error('Error loading category projects:', error);
    res.status(500).send('Error loading projects');
  }
});


/**
 * GET /projects/:slug
 * Individual project detail page with sidebar
 */
router.get('/projects/:slug', async (req, res) => {
  try {
    const project = await projectsRepo.getProjectBySlug(req.params.slug);

    if (!project) {
      res.locals.layout = 'layouts/layout-full';
      return res.status(404).render('404', {
        title: '404 - Not Found'
      });
    }

    const otherProjects = await projectsRepo.getOtherActiveProjects(req.params.slug);

    res.locals.layout = 'layouts/layout-sidebar';
    res.render('project-details', {
      title: project.title,
      project,
      otherProjects
    });
  } catch (error) {
    console.error('Error loading project:', error);
    res.status(500).send('Error loading project');
  }
});

/**
 * GET /contact
 * Contact form page
 */
router.get('/contact', (req, res) => {
  res.locals.layout = 'layouts/layout-full';
  res.render('contact', {
    title: 'Contact'
  });
});

/**
 * POST /contact
 * Handle contact form submission
 */
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    res.locals.layout = 'layouts/layout-full';
    return res.render('contact', {
      title: 'Contact',
      error: 'Please provide name, email, and message.'
    });
  }

  try {
    // Save to MongoDB
    await Contact.create({
      name,
      email,
      message,
      postedDate: new Date(),
      isRead: false
    });

    console.log('Contact form submission saved to database:', { name, email });

    // Render success page
    res.locals.layout = 'layouts/layout-full';
    res.render('contact-success', {
      title: 'Message Sent',
      name
    });
  } catch (error) {
    console.error('Error saving contact submission:', error);
    res.locals.layout = 'layouts/layout-full';
    res.render('contact', {
      title: 'Contact',
      error: 'An error occurred. Please try again.'
    });
  }
});

module.exports = router;
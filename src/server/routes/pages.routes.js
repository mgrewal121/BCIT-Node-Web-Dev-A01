const express = require('express');
const router = express.Router();
const projectsRepo = require('../lib/projects.repository');

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
router.get('/projects', (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const projects = projectsRepo.getActiveProjects(searchTerm);

    res.locals.layout = 'layouts/layout-full';
    res.render('projects', {
      title: 'Projects',
      projects,
      searchTerm
    });
  } catch (error) {
    console.error('Error loading projects:', error);
    res.status(500).send('Error loading projects');
  }
});

/**
 * GET /projects/:slug
 * Individual project detail page with sidebar
 */
router.get('/projects/:slug', (req, res) => {
  try {
    const project = projectsRepo.getProjectBySlug(req.params.slug);

    if (!project) {
      res.locals.layout = 'layouts/layout-full';
      return res.status(404).render('404', {
        title: '404 - Not Found'
      });
    }

    const otherProjects = projectsRepo.getOtherActiveProjects(req.params.slug);

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
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    res.locals.layout = 'layouts/layout-full';
    return res.render('contact', {
      title: 'Contact',
      error: 'Please provide name, email, and message.'
    });
  }

  // Log the submission (in production, you'd send email or save to DB)
  console.log('Contact form submission:', { name, email, message });

  // Render success page
  res.locals.layout = 'layouts/layout-full';
  res.render('contact-success', {
    title: 'Message Sent',
    name
  });
});

module.exports = router;
const express = require('express');
const router = express.Router();
const projectsRepo = require('../lib/projects.repository');

// Used Claude to help me not use path field

// Page routes
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Home',
    layout: 'layouts/layout-full'
  });
});

router.get('/about', (req, res) => {
  res.render('about', {
    title: 'About',
    layout: 'layouts/layout-full'
  });
});

router.get('/projects', (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const projects = projectsRepo.getActiveProjects(searchTerm);

    res.render('projects', {
      title: 'Projects',
      layout: 'layouts/layout-full',
      projects,
      searchTerm
    });
  } catch (error) {
    console.error('Error loading projects:', error);
    res.status(500).send('Error loading projects');
  }
});

router.get('/projects/:slug', (req, res) => {
  try {
    const project = projectsRepo.getProjectBySlug(req.params.slug);

    if (!project) {
      return res.status(404).render('404', {
        title: '404 - Not Found',
        layout: 'layouts/layout-full'
      });
    }

    const otherProjects = projectsRepo.getOtherActiveProjects(req.params.slug);

    res.render('project-details', {
      title: project.title,
      layout: 'layouts/layout-sidebar',
      project,
      otherProjects
    });
  } catch (error) {
    console.error('Error loading project:', error);
    res.status(500).send('Error loading project');
  }
});

router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'Contact',
    layout: 'layouts/layout-full'
  });
});

// Submission route for contact form
router.post('/contact', (req, res) => {
  const { name, email, message } = req.body;

  // Validation
  if (!name || !email || !message) {
    return res.render('contact', {
      title: 'Contact',
      layout: 'layouts/layout-full',
      error: 'Please provide name, email, and message.'
    });
  }

  console.log('Contact form submission:', { name, email, message });

  // Success!
  res.render('contact-success', {
    title: 'Message Sent',
    layout: 'layouts/layout-full',
    name
  });
});

module.exports = router;
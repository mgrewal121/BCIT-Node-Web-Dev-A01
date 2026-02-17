const express = require('express');
const router = express.Router();
const projectsRepo = require('../lib/projects.repository');

// GET
router.get('/projects', (req, res) => {
  try {
    const query = req.query.q || '';
    const activeProjects = projectsRepo.getActiveProjects(query);
    res.json(activeProjects);
  } catch (error) {
    console.error('Error reading projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET by id
router.get('/projects/:id', (req, res) => {
  try {
    const project = projectsRepo.getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error reading project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
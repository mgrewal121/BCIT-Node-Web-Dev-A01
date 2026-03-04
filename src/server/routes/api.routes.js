const express = require('express');
const router = express.Router();
const projectsRepo = require('../lib/projects.repository');
const { Category } = require('../models');

// GET
router.get('/projects', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    const tagFilter = req.query.tag || '';
    
    const projects = await projectsRepo.getActiveProjects(searchTerm, tagFilter);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET by category slug
router.get('/projects/category/:slug', async (req, res) => {
  try {
    const projects = await projectsRepo.getProjectsByCategory(req.params.slug);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects by category:', error);
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

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
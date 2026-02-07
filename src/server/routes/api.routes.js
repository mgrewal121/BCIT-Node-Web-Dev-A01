const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();


const projectsPath = path.join(__dirname, '../../../data/projects.json');


function getProjects() {
  const data = fs.readFileSync(projectsPath, 'utf-8');
  return JSON.parse(data);
}

// GET
router.get('/projects', (req, res) => {
  try {
    const { projects } = getProjects();
    const query = req.query.q?.toLowerCase();

    // CHATGPT: Filter only active projects
    let activeProjects = projects.filter(p => p.status === true);

    // CHATGPT: Apply search filter
    if (query) {
      activeProjects = activeProjects.filter(project => {
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesTagline = project.tagline.toLowerCase().includes(query);
        const matchesDescription = project.description.toLowerCase().includes(query);
        const matchesStack = project.stack.some(item => item.toLowerCase().includes(query));
        const matchesTags = project.tags.some(tag => tag.toLowerCase().includes(query));

        return matchesTitle || matchesTagline || matchesDescription || matchesStack || matchesTags;
      });
    }

    res.json(activeProjects);
  } catch (error) {
    console.error('Error reading projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET by id
router.get('/projects/:id', (req, res) => {
  try {
    const { projects } = getProjects();
    const project = projects.find(p => p.id === req.params.id);

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
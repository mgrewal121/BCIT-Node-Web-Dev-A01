// CLAUDE Generated FILE

const fs = require('fs');
const path = require('path');

const projectsPath = path.join(__dirname, '../../../data/projects.json');

/**
 * Load all projects from JSON file
 */
function loadProjects() {
  const data = fs.readFileSync(projectsPath, 'utf-8');
  const { projects } = JSON.parse(data);
  return projects;
}

/**
 * Get all active projects (status === true)
 * @param {string} searchTerm - Optional search query
 * @returns {Array} Filtered active projects
 */
function getActiveProjects(searchTerm = '') {
  const projects = loadProjects();
  let activeProjects = projects.filter(p => p.status === true);

  if (searchTerm) {
    const query = searchTerm.toLowerCase();
    activeProjects = activeProjects.filter(project => {
      const matchesTitle = project.title.toLowerCase().includes(query);
      const matchesTagline = project.tagline.toLowerCase().includes(query);
      const matchesDescription = project.description.toLowerCase().includes(query);
      const matchesStack = project.stack.some(item => item.toLowerCase().includes(query));
      const matchesTags = project.tags.some(tag => tag.toLowerCase().includes(query));

      return matchesTitle || matchesTagline || matchesDescription || matchesStack || matchesTags;
    });
  }

  return activeProjects;
}

/**
 * Get a single project by ID
 * @param {string} id - Project ID
 * @returns {Object|null} Project object or null
 */
function getProjectById(id) {
  const projects = loadProjects();
  return projects.find(p => p.id === id) || null;
}

/**
 * Get a single project by slug
 * @param {string} slug - Project slug
 * @returns {Object|null} Project object or null
 */
function getProjectBySlug(slug) {
  const projects = loadProjects();
  return projects.find(p => p.slug === slug) || null;
}

/**
 * Get other active projects excluding the current one
 * @param {string} currentSlug - Slug of current project to exclude
 * @returns {Array} Other active projects
 */
function getOtherActiveProjects(currentSlug) {
  return getActiveProjects().filter(p => p.slug !== currentSlug);
}

module.exports = {
  loadProjects,
  getActiveProjects,
  getProjectById,
  getProjectBySlug,
  getOtherActiveProjects
};
const { Project } = require('../models');
// CLAUDE Generated file

/**
 * Get all active projects (isActive === true)
 * @param {string} searchTerm - Optional search query
 * @param {string} tagFilter - Optional tag filter
 * @returns {Promise<Array>} Active projects
 */
async function getActiveProjects(searchTerm = '', tagFilter = '') {
  try {
    let query = { isActive: true };

    // Search filter (title, description, tagline)
    if (searchTerm) {
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tagline: { $regex: searchTerm, $options: 'i' } },
        { stack: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Tag filter
    if (tagFilter) {
      query['tags.name'] = { $regex: tagFilter, $options: 'i' };
    }

    const projects = await Project.find(query)
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    return projects;
  } catch (error) {
    console.error('Error fetching active projects:', error);
    throw error;
  }
}

/**
 * Get a single project by MongoDB _id
 * @param {string} id - MongoDB ObjectId
 * @returns {Promise<Object|null>} Project or null
 */
async function getProjectById(id) {
  try {
    const project = await Project.findById(id)
      .populate('categoryId', 'name slug description')
      .lean();
    return project;
  } catch (error) {
    console.error('Error fetching project by ID:', error);
    return null;
  }
}

/**
 * Get a single project by slug
 * @param {string} slug - Project slug
 * @returns {Promise<Object|null>} Project or null
 */
async function getProjectBySlug(slug) {
  try {
    const project = await Project.findOne({ slug })
      .populate('categoryId', 'name slug description')
      .lean();
    return project;
  } catch (error) {
    console.error('Error fetching project by slug:', error);
    return null;
  }
}

/**
 * Get other active projects excluding the current one
 * @param {string} currentSlug - Slug of current project to exclude
 * @returns {Promise<Array>} Other active projects
 */
async function getOtherActiveProjects(currentSlug) {
  try {
    const projects = await Project.find({ 
      isActive: true,
      slug: { $ne: currentSlug }
    })
      .populate('categoryId', 'name slug')
      .limit(5)
      .sort({ createdAt: -1 })
      .lean();

    return projects;
  } catch (error) {
    console.error('Error fetching other projects:', error);
    return [];
  }
}

/**
 * Get projects by category slug
 * @param {string} categorySlug - Category slug
 * @returns {Promise<Array>} Projects in that category
 */
async function getProjectsByCategory(categorySlug) {
  try {
    // First find the category
    const { Category } = require('../models');
    const category = await Category.findOne({ slug: categorySlug });
    
    if (!category) {
      return [];
    }

    // Then find projects with that categoryId
    const projects = await Project.find({ 
      isActive: true,
      categoryId: category._id 
    })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    return projects;
  } catch (error) {
    console.error('Error fetching projects by category:', error);
    return [];
  }
}

/**
 * Get all projects (including inactive) - for admin
 * @returns {Promise<Array>} All projects
 */
async function getAllProjects() {
  try {
    const projects = await Project.find()
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    return projects;
  } catch (error) {
    console.error('Error fetching all projects:', error);
    throw error;
  }
}

module.exports = {
  getActiveProjects,
  getProjectById,
  getProjectBySlug,
  getOtherActiveProjects,
  getProjectsByCategory,
  getAllProjects
};
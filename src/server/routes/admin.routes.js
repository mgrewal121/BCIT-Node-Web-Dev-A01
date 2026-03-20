const express = require('express');
const router = express.Router();
const path = require('path');
const { Category, Project, Contact, User } = require('../models');
const { isModerator, isAdmin } = require('../middleware/auth');
const upload = require('../config/multer');


/**
 * GET /admin
 * Admin dashboard - accessible to MODERATOR and ADMIN
 */
router.get('/', isModerator, async (req, res) => {
  try {
    const stats = {
      totalProjects: await Project.countDocuments(),
      activeProjects: await Project.countDocuments({ isActive: true }),
      totalCategories: await Category.countDocuments(),
      unreadContacts: await Contact.countDocuments({ isRead: false }),
      totalContacts: await Contact.countDocuments(),
      totalUsers: await User.countDocuments()
    };

    res.locals.layout = 'layouts/layout-full';
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.status(500).send('Error loading dashboard');
  }
});

/**
 * GET /admin/contacts
 * List all contact submissions - MODERATOR and ADMIN
 */
router.get('/contacts', isModerator, async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ postedDate: -1 })
      .lean();

    res.locals.layout = 'layouts/layout-full';
    res.render('admin/contacts', {
      title: 'Manage Contacts',
      contacts
    });
  } catch (error) {
    console.error('Error loading contacts:', error);
    res.status(500).send('Error loading contacts');
  }
});

/**
 * PATCH /admin/contacts/:id/read
 * Toggle read/unread status - MODERATOR and ADMIN
 */
router.patch('/contacts/:id/read', isModerator, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    contact.isRead = !contact.isRead;
    await contact.save();

    res.json({ success: true, isRead: contact.isRead });
  } catch (error) {
    console.error('Error toggling contact read status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /admin/contacts/:id
 * Delete a contact submission - ADMIN ONLY
 */
router.delete('/contacts/:id', isAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /admin/categories
 * List all categories - ADMIN ONLY
 */
router.get('/categories', isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    // Get project count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const projectCount = await Project.countDocuments({ categoryId: category._id });
        return { ...category, projectCount };
      })
    );

    res.locals.layout = 'layouts/layout-full';
    res.render('admin/categories', {
      title: 'Manage Categories',
      categories: categoriesWithCount
    });
  } catch (error) {
    console.error('Error loading categories:', error);
    res.status(500).send('Error loading categories');
  }
});

/**
 * GET /admin/categories/new
 * Create category form - ADMIN ONLY
 */
router.get('/categories/new', isAdmin, (req, res) => {
  res.locals.layout = 'layouts/layout-full';
  res.render('admin/category-form', {
    title: 'Create Category',
    category: null
  });
});

/**
 * POST /admin/categories
 * Create category - ADMIN ONLY
 */
router.post('/categories', isAdmin, async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    // Validation
    if (!name || !slug) {
      res.locals.layout = 'layouts/layout-full';
      return res.render('admin/category-form', {
        title: 'Create Category',
        category: { name, slug, description },
        error: 'Name and slug are required'
      });
    }

    await Category.create({ name, slug, description });
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error creating category:', error);
    res.locals.layout = 'layouts/layout-full';
    res.render('admin/category-form', {
      title: 'Create Category',
      category: req.body,
      error: error.code === 11000 ? 'Slug already exists' : 'Error creating category'
    });
  }
});

/**
 * GET /admin/categories/:id/edit
 * Edit category form - ADMIN ONLY
 */
router.get('/categories/:id/edit', isAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();

    if (!category) {
      return res.status(404).send('Category not found');
    }

    res.locals.layout = 'layouts/layout-full';
    res.render('admin/category-form', {
      title: 'Edit Category',
      category
    });
  } catch (error) {
    console.error('Error loading category:', error);
    res.status(500).send('Error loading category');
  }
});

/**
 * POST /admin/categories/:id
 * Update category - ADMIN ONLY
 */
router.post('/categories/:id', isAdmin, async (req, res) => {
  try {
    const { name, slug, description } = req.body;

    if (!name || !slug) {
      const category = await Category.findById(req.params.id).lean();
      res.locals.layout = 'layouts/layout-full';
      return res.render('admin/category-form', {
        title: 'Edit Category',
        category: { ...category, name, slug, description },
        error: 'Name and slug are required'
      });
    }

    await Category.findByIdAndUpdate(req.params.id, { name, slug, description });
    res.redirect('/admin/categories');
  } catch (error) {
    console.error('Error updating category:', error);
    const category = await Category.findById(req.params.id).lean();
    res.locals.layout = 'layouts/layout-full';
    res.render('admin/category-form', {
      title: 'Edit Category',
      category,
      error: error.code === 11000 ? 'Slug already exists' : 'Error updating category'
    });
  }
});

/**
 * DELETE /admin/categories/:id
 * Delete category - ADMIN ONLY
 */
router.delete('/categories/:id', isAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if any projects reference this category
    const projectCount = await Project.countDocuments({ categoryId: req.params.id });
    
    if (projectCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete category. ${projectCount} project(s) are using this category.` 
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /admin/projects
 * List all projects - ADMIN ONLY
 */
router.get('/projects', isAdmin, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    res.locals.layout = 'layouts/layout-full';
    res.render('admin/projects', {
      title: 'Manage Projects',
      projects
    });
  } catch (error) {
    console.error('Error loading projects:', error);
    res.status(500).send('Error loading projects');
  }
});

/**
 * GET /admin/projects/new
 * Create project form - ADMIN ONLY
 */
router.get('/projects/new', isAdmin, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();

    res.locals.layout = 'layouts/layout-full';
    res.render('admin/project-form', {
      title: 'Create Project',
      project: null,
      categories
    });
  } catch (error) {
    console.error('Error loading form:', error);
    res.status(500).send('Error loading form');
  }
});

/**
 * POST /admin/projects
 * Create project - ADMIN ONLY
 */
router.post('/projects', isAdmin, async (req, res) => {
  try {
    const { slug, title, tagline, description, isActive, categoryId, tags, stack } = req.body;

    const tagArray = tags ? tags.split(',').map(t => ({ name: t.trim() })).filter(t => t.name) : [];
    const stackArray = stack ? stack.split(',').map(s => s.trim()).filter(s => s) : [];

    await Project.create({
      slug,
      title,
      tagline,
      description,
      isActive: isActive === 'true',
      categoryId,
      tags: tagArray,
      stack: stackArray
    });

    res.redirect('/admin/projects');
  } catch (error) {
    console.error('Error creating project:', error);
    const categories = await Category.find().sort({ name: 1 }).lean();
    res.locals.layout = 'layouts/layout-full';
    res.render('admin/project-form', {
      title: 'Create Project',
      project: req.body,
      categories,
      error: error.code === 11000 ? 'Slug already exists' : 'Error creating project'
    });
  }
});

/**
 * GET /admin/projects/:id/edit
 * Edit project form - ADMIN ONLY
 */
router.get('/projects/:id/edit', isAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    const categories = await Category.find().sort({ name: 1 }).lean();

    if (!project) {
      return res.status(404).send('Project not found');
    }

    // Convert tags array to comma-separated string
    project.tagsString = project.tags.map(t => t.name).join(', ');
    project.stackString = project.stack.join(', ');

    res.locals.layout = 'layouts/layout-full';
    res.render('admin/project-form', {
      title: 'Edit Project',
      project,
      categories
    });
  } catch (error) {
    console.error('Error loading project:', error);
    res.status(500).send('Error loading project');
  }
});

/**
 * POST /admin/projects/:id
 * Update project - ADMIN ONLY
 */
router.post('/projects/:id', isAdmin, async (req, res) => {
  try {
    const { slug, title, tagline, description, isActive, categoryId, tags, stack } = req.body;

    const tagArray = tags ? tags.split(',').map(t => ({ name: t.trim() })).filter(t => t.name) : [];
    const stackArray = stack ? stack.split(',').map(s => s.trim()).filter(s => s) : [];

    await Project.findByIdAndUpdate(req.params.id, {
      slug,
      title,
      tagline,
      description,
      isActive: isActive === 'true',
      categoryId,
      tags: tagArray,
      stack: stackArray
    });

    res.redirect('/admin/projects');
  } catch (error) {
    console.error('Error updating project:', error);
    const categories = await Category.find().sort({ name: 1 }).lean();
    const project = await Project.findById(req.params.id).lean();
    res.locals.layout = 'layouts/layout-full';
    res.render('admin/project-form', {
      title: 'Edit Project',
      project,
      categories,
      error: error.code === 11000 ? 'Slug already exists' : 'Error updating project'
    });
  }
});

/**
 * DELETE /admin/projects/:id
 * Delete project - ADMIN ONLY
 */
router.delete('/projects/:id', isAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /admin/projects/:id/images
 * Manage images for a project - ADMIN ONLY
 */
router.get('/projects/:id/images', isAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('categoryId', 'name')
      .lean();

    if (!project) {
      return res.status(404).send('Project not found');
    }

    res.locals.layout = 'layouts/layout-full';
    res.render('admin/project-images', {
      title: `Manage Images - ${project.title}`,
      project
    });
  } catch (error) {
    console.error('Error loading project images:', error);
    res.status(500).send('Error loading project images');
  }
});

/**
 * POST /admin/projects/:id/images
 * Upload new image to project - ADMIN ONLY
 */
router.post('/projects/:id/images', isAdmin, upload.single('image'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const { alt } = req.body;

    // Add new image 
    const newImage = {
      path: `/uploads/${req.file.filename}`,
      alt: alt || project.title,
      isFeatured: project.images.length === 0 
    };

    project.images.push(newImage);
    await project.save();

    res.json({ 
      success: true, 
      message: 'Image uploaded successfully',
      image: newImage
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Error uploading image' });
  }
});

/**
 * PATCH /admin/projects/:projectId/images/:imageId/featured
 * Set an image as featured - ADMIN ONLY
 */
router.patch('/projects/:projectId/images/:imageId/featured', isAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Unset all featured flags
    project.images.forEach(img => img.isFeatured = false);

    // Set new featured image
    const image = project.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    image.isFeatured = true;
    await project.save();

    res.json({ success: true, message: 'Featured image updated' });
  } catch (error) {
    console.error('Error setting featured image:', error);
    res.status(500).json({ error: 'Error setting featured image' });
  }
});

/**
 * DELETE /admin/projects/:projectId/images/:imageId
 * Delete an image from project - ADMIN ONLY
 */
router.delete('/projects/:projectId/images/:imageId', isAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const image = project.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete file from disk
    const fs = require('fs');
    const imagePath = path.join(__dirname, '../../../public', image.path);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove from database
    image.deleteOne();
    await project.save();

    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Error deleting image' });
  }
});

module.exports = router;
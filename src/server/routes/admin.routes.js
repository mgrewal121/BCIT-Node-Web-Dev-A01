const express = require('express');
const router = express.Router();
const { Category, Project, Contact } = require('../models');

// GET admin dashboard
router.get('/', async (req, res) => {
  try {
    const stats = {
      totalProjects: await Project.countDocuments(),
      activeProjects: await Project.countDocuments({ isActive: true }),
      totalCategories: await Category.countDocuments(),
      unreadContacts: await Contact.countDocuments({ isRead: false }),
      totalContacts: await Contact.countDocuments()
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

// GET all contact submissions
router.get('/contacts', async (req, res) => {
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

// PATCH toggle contact read/unread
router.patch('/contacts/:id/read', async (req, res) => {
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

// DELETE contact submission
router.delete('/contacts/:id', async (req, res) => {
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


// GET all categories
router.get('/categories', async (req, res) => {
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

// GET create category form
router.get('/categories/new', (req, res) => {
  res.locals.layout = 'layouts/layout-full';
  res.render('admin/category-form', {
    title: 'Create Category',
    category: null
  });
});

// POST create category
router.post('/categories', async (req, res) => {
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

// GET edit category form
router.get('/categories/:id/edit', async (req, res) => {
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

// POST update category
router.post('/categories/:id', async (req, res) => {
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

// DELETE category if no projects reference it
router.delete('/categories/:id', async (req, res) => {
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

// GET all projects
router.get('/projects', async (req, res) => {
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

// GET create project form
router.get('/projects/new', async (req, res) => {
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

// Create a new project
// USED CLAUDE TO GENERATE THIS FUNCTION
router.post('/projects', async (req, res) => {
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

// GET edit project form
router.get('/projects/:id/edit', async (req, res) => {
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

// POST update project
router.post('/projects/:id', async (req, res) => {
  try {
    const { slug, title, tagline, description, isActive, categoryId, tags, stack } = req.body;

    // Parse tags from comma-separated string
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

// DELETE a project
router.delete('/projects/:id', async (req, res) => {
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

module.exports = router;
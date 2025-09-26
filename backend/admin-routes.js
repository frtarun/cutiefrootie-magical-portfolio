// Admin routes for content management
const { body, validationResult } = require('express-validator');

/**
 * Setup admin routes
 */
function setupAdminRoutes(app, Contact, Project, BlogPost, requireAuth, requireAdmin) {

  // Get all contacts (admin only)
  app.get('/api/admin/contacts', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status, limit = 50, skip = 0 } = req.query;
      
      let query = {};
      if (status) query.status = status;

      const contacts = await Contact.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await Contact.countDocuments(query);

      res.json({
        contacts,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: (parseInt(skip) + parseInt(limit)) < total
        }
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ error: 'Failed to fetch contacts' });
    }
  });

  // Update contact status (admin only)
  app.patch('/api/admin/contacts/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['pending', 'responded'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!contact) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      res.json({ contact });
    } catch (error) {
      console.error('Error updating contact:', error);
      res.status(500).json({ error: 'Failed to update contact' });
    }
  });

  // Create new project (admin only)
  app.post('/api/admin/projects', requireAuth, requireAdmin, [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required (1-200 chars)'),
    body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required (1-1000 chars)'),
    body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
    body('liveUrl').optional().isURL().withMessage('Invalid live URL'),
    body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('featured').optional().isBoolean().withMessage('Featured must be boolean')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const project = new Project(req.body);
      await project.save();

      res.status(201).json({ project });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  });

  // Update project (admin only)
  app.put('/api/admin/projects/:id', requireAuth, requireAdmin, [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required (1-200 chars)'),
    body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required (1-1000 chars)'),
    body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
    body('liveUrl').optional().isURL().withMessage('Invalid live URL'),
    body('githubUrl').optional().isURL().withMessage('Invalid GitHub URL'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('featured').optional().isBoolean().withMessage('Featured must be boolean')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const project = await Project.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ project });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  });

  // Delete project (admin only)
  app.delete('/api/admin/projects/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const project = await Project.findByIdAndDelete(req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  });

  // Create new blog post (admin only)
  app.post('/api/admin/blog/posts', requireAuth, requireAdmin, [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required (1-200 chars)'),
    body('slug').trim().isLength({ min: 1, max: 200 }).matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase letters, numbers, and hyphens only'),
    body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt max 500 chars'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('featured').optional().isBoolean().withMessage('Featured must be boolean'),
    body('publishedAt').optional().isISO8601().withMessage('Invalid date format')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Set publishedAt to now if not provided
      if (!req.body.publishedAt) {
        req.body.publishedAt = new Date();
      }

      const blogPost = new BlogPost(req.body);
      await blogPost.save();

      res.status(201).json({ blogPost });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
      console.error('Error creating blog post:', error);
      res.status(500).json({ error: 'Failed to create blog post' });
    }
  });

  // Update blog post (admin only)
  app.put('/api/admin/blog/posts/:id', requireAuth, requireAdmin, [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required (1-200 chars)'),
    body('slug').trim().isLength({ min: 1, max: 200 }).matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase letters, numbers, and hyphens only'),
    body('excerpt').optional().trim().isLength({ max: 500 }).withMessage('Excerpt max 500 chars'),
    body('content').trim().isLength({ min: 1 }).withMessage('Content is required'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('featured').optional().isBoolean().withMessage('Featured must be boolean'),
    body('publishedAt').optional().isISO8601().withMessage('Invalid date format')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const blogPost = await BlogPost.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      res.json({ blogPost });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
      console.error('Error updating blog post:', error);
      res.status(500).json({ error: 'Failed to update blog post' });
    }
  });

  // Delete blog post (admin only)
  app.delete('/api/admin/blog/posts/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
      const blogPost = await BlogPost.findByIdAndDelete(req.params.id);
      
      if (!blogPost) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      res.json({ message: 'Blog post deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      res.status(500).json({ error: 'Failed to delete blog post' });
    }
  });

  // Get all blog posts for admin (includes unpublished)
  app.get('/api/admin/blog/posts', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { limit = 20, skip = 0 } = req.query;

      const posts = await BlogPost.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await BlogPost.countDocuments();

      res.json({
        posts,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: (parseInt(skip) + parseInt(limit)) < total
        }
      });
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
  });

  // Get all projects for admin
  app.get('/api/admin/projects', requireAuth, requireAdmin, async (req, res) => {
    try {
      const { limit = 20, skip = 0 } = req.query;

      const projects = await Project.find()
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip));

      const total = await Project.countDocuments();

      res.json({
        projects,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: (parseInt(skip) + parseInt(limit)) < total
        }
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  });

  // Dashboard stats (admin only)
  app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
      const [
        totalContacts,
        pendingContacts,
        totalProjects,
        totalBlogPosts,
        recentContacts
      ] = await Promise.all([
        Contact.countDocuments(),
        Contact.countDocuments({ status: 'pending' }),
        Project.countDocuments(),
        BlogPost.countDocuments(),
        Contact.find().sort({ createdAt: -1 }).limit(5)
      ]);

      res.json({
        stats: {
          totalContacts,
          pendingContacts,
          totalProjects,
          totalBlogPosts
        },
        recentContacts
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });
}

module.exports = { setupAdminRoutes };
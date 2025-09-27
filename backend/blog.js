const express = require('express');
const router = express.Router();

// In-memory data store. For a larger application, consider a database.
const { blogPosts } = require('../blog-routes');

// GET all blog posts with filtering and sorting
router.get('/posts', (req, res) => {
  const { featured, tag, limit } = req.query;
  let posts = [...blogPosts]; // Create a mutable copy

  // Sort by most recent first
  posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  if (featured === 'true') {
    posts = posts.filter(post => post.featured);
  }

  if (tag) {
    posts = posts.filter(post => post.tags.includes(tag));
  }

  if (limit) {
    // Ensure limit is a positive integer
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      posts = posts.slice(0, parsedLimit);
    }
  }

  res.json(posts);
});

// GET single blog post by slug
router.get('/posts/:slug', (req, res) => {
  const post = blogPosts.find(p => p.slug === req.params.slug);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
});

// GET all unique blog tags
router.get('/tags', (req, res) => {
  const allTags = [...new Set(blogPosts.flatMap(post => post.tags))];
  res.json(allTags);
});

module.exports = router;
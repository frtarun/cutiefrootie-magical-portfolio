// Blog functionality for the backend
// Add this to your main index.js file

const blogPosts = [
  {
    id: '1',
    title: 'Building Magical Websites: My Journey',
    slug: 'building-magical-websites-my-journey',
    excerpt: 'How I started creating whimsical, personalized websites that bring joy to special occasions.',
    content: `
      <p>Welcome to my first blog post! I'm excited to share the story behind these magical websites.</p>
      <p>It all started when I wanted to create something special for my friend's birthday...</p>
      <p>The goal was simple: bring more joy and personality to the web, one magical site at a time.</p>
    `,
    author: 'CutieFrootie',
    publishedAt: '2024-01-15T10:00:00Z',
    tags: ['story', 'inspiration', 'web-development'],
    featured: true,
  },
  {
    id: '2',
    title: 'CSS Animations That Spark Joy',
    slug: 'css-animations-that-spark-joy',
    excerpt: 'Simple CSS tricks to add delightful animations to your websites without overwhelming users.',
    content: `
      <p>Animations can make or break a user experience. Here's how to add just the right amount of magic...</p>
      <p>The key is subtlety - animations should enhance, not distract.</p>
      <code>@keyframes sparkle { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }</code>
    `,
    author: 'CutieFrootie',
    publishedAt: '2024-01-20T14:30:00Z',
    tags: ['css', 'animations', 'tutorial'],
    featured: false,
  }
];

// Blog endpoints to add to your main server:
/*
// Get all blog posts
app.get('/api/blog/posts', (req, res) => {
  const { featured, tag, limit } = req.query;
  let posts = [...blogPosts];
  
  if (featured === 'true') {
    posts = posts.filter(post => post.featured);
  }
  
  if (tag) {
    posts = posts.filter(post => post.tags.includes(tag));
  }
  
  if (limit) {
    posts = posts.slice(0, parseInt(limit));
  }
  
  // Sort by publishedAt desc
  posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  res.json(posts);
});

// Get single blog post
app.get('/api/blog/posts/:slug', (req, res) => {
  const post = blogPosts.find(p => p.slug === req.params.slug);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
});

// Get blog tags
app.get('/api/blog/tags', (req, res) => {
  const allTags = [...new Set(blogPosts.flatMap(post => post.tags))];
  res.json(allTags);
});
*/

module.exports = { blogPosts };
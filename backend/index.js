/**
 * Backend server for CutieFrootie's Magical Portfolio
 * Features:
 * - Express with Helmet, CORS, Morgan, JSON body parser, rate limiting
 * - Health check
 * - Showcase projects and tutorial videos endpoints
 * - Contact form endpoint (nodemailer) with graceful fallback if SMTP isn't configured
 * - Optional static serving of built frontend (../dist) when SERVE_STATIC=true
 */

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

// Import auth and admin functionality
const { requireAuth, requireAdmin, handleLogin, handleMe } = require('./auth');
const { setupAdminRoutes } = require('./admin-routes');

const app = express();

// Config
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// CORS setup
let corsOptions = {};
if (CORS_ORIGIN === '*') {
  corsOptions = { origin: true, credentials: false };
} else {
  const allowList = CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
  corsOptions = {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowList.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS: ' + origin));
    },
    credentials: true,
  };
}

// MongoDB Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
} else {
  console.warn('⚠️ MONGODB_URI not set. Using in-memory data only.');
}

// MongoDB Schemas
const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ['pending', 'responded'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: String,
  liveUrl: String,
  githubUrl: String,
  tags: [String],
  featured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  content: { type: String, required: true },
  author: { type: String, default: 'CutieFrootie' },
  publishedAt: Date,
  tags: [String],
  featured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', ContactSchema);
const Project = mongoose.model('Project', ProjectSchema);
const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

// Middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit contact form to 5 submissions per 15 minutes per IP
  message: { error: 'Too many contact form submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Sample data (mirrors frontend data.ts)
const staticFilesUrl = 'https://www.gstatic.com/aistudio/starter-apps/veo3-gallery/';

const showcaseProjects = [
  {
    id: '1',
    title: 'Varsha’s Magical Birthday Website',
    description: 'A whimsical, interactive birthday site with animations and personalized messages.',
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Birthday', 'Playful'],
  },
  {
    id: '2',
    title: 'Our Anniversary Storybook',
    description: "A digital storybook that recounts a couple's journey with beautiful illustrations and notes.",
    imageUrl: 'https://images.unsplash.com/photo-1494774152422-bcf3c88536b1?auto=format&fit=crop&w=800&q=80',
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Anniversary', 'Personalized'],
  },
  {
    id: '3',
    title: 'Paws & Play Mini-Game',
    description: 'A cute and simple mini-game where you take care of a virtual pet.',
    imageUrl: 'https://images.unsplash.com/photo-1583337130417-234604081635?auto=format&fit=crop&w=800&q=80',
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Game', 'Playful'],
  },
  {
    id: '4',
    title: 'Interactive Wedding Invitation',
    description: 'A modern and magical wedding invitation website with RSVP functionality.',
    imageUrl: 'https://images.unsplash.com/photo-1560962916-8c4604a37344?auto=format&fit=crop&w=800&q=80',
    liveUrl: '#',
    githubUrl: '#',
    tags: ['Personalized'],
  },
];

const tutorialVideos = [
  {
    id: '1',
    title: 'How to Clone and Run the Project from GitHub',
    description:
      "A step-by-step guide to get you started. This video walks you through cloning the repository, installing dependencies, and launching the website on your local machine. Perfect for beginners who want to use these magical templates!",
    videoUrl: staticFilesUrl + 'Video_Game_Trailer_Sci_Fi_Urban_Chasemp4.mp4',
  },
  {
    id: '2',
    title: 'Customizing Your Magical Website',
    description:
      "Learn how to personalize your new website. This tutorial covers changing text, swapping out images, and modifying the color scheme to make the project truly your own. Unleash your creativity!",
    videoUrl: staticFilesUrl + 'Characters_intense_talking.mp4',
  },
];

// Authentication routes
app.post('/api/auth/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 1 }).withMessage('Password required')
], handleLogin);

app.get('/api/auth/me', requireAuth, handleMe);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Showcase projects
app.get('/api/showcase-projects', (req, res) => {
  res.json(showcaseProjects);
});

// Tutorial videos
app.get('/api/tutorial-videos', (req, res) => {
  res.json(tutorialVideos);
});

// Sample blog posts
const blogPosts = [
  {
    id: '1',
    title: 'Building Magical Websites: My Journey',
    slug: 'building-magical-websites-my-journey',
    excerpt: 'How I started creating whimsical, personalized websites that bring joy to special occasions.',
    content: `
      <p>Welcome to my first blog post! I'm excited to share the story behind these magical websites.</p>
      <p>It all started when I wanted to create something special for my friend's birthday. Instead of just buying a generic card, I decided to build an entire website dedicated to celebrating her special day.</p>
      <p>The response was incredible! Friends and family loved the personal touch, the animations, and how it captured her personality perfectly. That's when I realized there was something special here.</p>
      <p>The goal was simple: bring more joy and personality to the web, one magical site at a time. Every project since then has been about creating moments of delight and connection.</p>
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
      <p>The key is subtlety - animations should enhance, not distract. Think of them as seasoning for your website.</p>
      <h3>My Favorite Animation Patterns</h3>
      <p><strong>1. Gentle Fade-ins:</strong> Perfect for content that appears as users scroll.</p>
      <pre><code>@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}</code></pre>
      <p><strong>2. Sparkle Effects:</strong> Add a touch of magic to buttons and important elements.</p>
      <pre><code>@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}</code></pre>
      <p>Remember: less is more. Use animations to guide attention and create emotional connections, not to show off.</p>
    `,
    author: 'CutieFrootie',
    publishedAt: '2024-01-20T14:30:00Z',
    tags: ['css', 'animations', 'tutorial'],
    featured: false,
  }
];

// Blog endpoints
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

app.get('/api/blog/posts/:slug', (req, res) => {
  const post = blogPosts.find(p => p.slug === req.params.slug);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.json(post);
});

app.get('/api/blog/tags', (req, res) => {
  const allTags = [...new Set(blogPosts.flatMap(post => post.tags))];
  res.json(allTags);
});

// Contact endpoint with MongoDB integration
app.post(
  '/api/contact',
  contactLimiter,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('message').trim().isLength({ min: 10, max: 5000 }).withMessage('Message must be 10-5000 characters'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, message } = req.body || {};

      // Save to MongoDB if connected
      if (mongoose.connection.readyState === 1) {
        try {
          const contact = new Contact({
            name,
            email,
            message,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
          await contact.save();
          console.log('✅ Contact saved to MongoDB');
        } catch (dbErr) {
          console.error('❌ Failed to save contact to MongoDB:', dbErr);
        }
      }

      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = Number(process.env.SMTP_PORT || 587);
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || smtpUser;
      const contactTo = process.env.CONTACT_TO || smtpUser;

      const smtpConfigured = Boolean(smtpHost && smtpPort && smtpUser && smtpPass);

      if (!smtpConfigured) {
        console.warn('[contact] SMTP not configured. Skipping email send.');
        console.info('[contact] Payload:', { name, email, message: message?.slice(0, 200) + (message?.length > 200 ? '…' : '') });
        return res.status(202).json({ status: 'accepted', info: 'Message received and saved.' });
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465, // true for 465, false for others
        auth: { user: smtpUser, pass: smtpPass },
      });

      const mailOptions = {
        from: smtpFrom,
        to: contactTo,
        replyTo: email,
        subject: `New Contact Form Submission from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      return res.status(200).json({ status: 'sent', messageId: info.messageId });
    } catch (err) {
      return next(err);
    }
  }
);

// Setup admin routes
setupAdminRoutes(app, Contact, Project, BlogPost, requireAuth, requireAdmin);

// Optional static serving of built frontend (if requested)
(function configureStaticServing() {
  if (String(process.env.SERVE_STATIC).toLowerCase() !== 'true') return;
  const distPath = path.resolve(__dirname, '..', 'dist');
  if (fs.existsSync(distPath)) {
    console.log('[static] Serving frontend from', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.warn('[static] SERVE_STATIC=true but dist folder not found at', distPath);
  }
})();

// 404 handler for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

// Helpers
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

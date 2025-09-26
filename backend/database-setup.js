// Database setup using Mongoose (already installed)
// Add this to your main index.js if you want persistent data

const mongoose = require('mongoose');

// Connect to MongoDB
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Schemas
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

// Enhanced contact endpoint with database storage
/*
app.post('/api/contact', 
  [validation middleware],
  async (req, res, next) => {
    try {
      // ... existing validation ...
      
      // Save to database
      const contact = new Contact({
        name,
        email,
        message,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      await contact.save();
      
      // ... existing email logic ...
      
    } catch (err) {
      next(err);
    }
  }
);
*/

module.exports = { Contact, Project, BlogPost };
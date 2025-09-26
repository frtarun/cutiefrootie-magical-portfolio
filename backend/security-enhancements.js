// Additional security measures

// 1. Enhanced Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://www.gstatic.com"],
      mediaSrc: ["'self'", "https://www.gstatic.com"],
      scriptSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false // Allow external images/videos
}));

// 2. Input sanitization
const mongoSanitize = require('express-mongo-sanitize'); // npm install express-mongo-sanitize
app.use(mongoSanitize());

// 3. Additional validation for contact form
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name must contain only letters, spaces, hyphens, and apostrophes'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage('Valid email required'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .matches(/^[\w\s.,!?'"()-]+$/)
    .withMessage('Message contains invalid characters'),
];

// 4. Honeypot field for spam protection
app.post('/api/contact', [
  ...contactValidation,
  body('website').isEmpty().withMessage('Spam detected') // Honeypot field
], async (req, res, next) => {
  // ... existing contact logic
});

// 5. Request size limits
app.use(express.json({ limit: '10kb' })); // Smaller limit for API
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. Disable X-Powered-By header
app.disable('x-powered-by');
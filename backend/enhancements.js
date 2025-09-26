// Production enhancements to add to your backend

// 1. Compression middleware (you have it installed but not used)
const compression = require('compression');
app.use(compression());

// 2. Enhanced rate limiting for different endpoints
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit contact form to 5 submissions per 15 minutes per IP
  message: { error: 'Too many contact form submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to contact endpoint specifically
app.use('/api/contact', contactLimiter);

// 3. Request logging in production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // More detailed logging for production
} else {
  app.use(morgan('dev'));
}

// 4. Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

// 5. Enhanced error logging
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  
  if (res.headersSent) return;
  
  // Don't leak error details in production
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(500).json({ 
    error: 'Internal Server Error',
    ...(isDev && { details: err.message })
  });
});

// 6. Analytics endpoint (optional)
let analytics = {
  pageViews: 0,
  contactSubmissions: 0,
  projectViews: 0
};

app.post('/api/analytics/track', (req, res) => {
  const { event, page } = req.body;
  
  switch(event) {
    case 'page_view':
      analytics.pageViews++;
      break;
    case 'contact_submit':
      analytics.contactSubmissions++;
      break;
    case 'project_view':
      analytics.projectViews++;
      break;
  }
  
  res.json({ status: 'tracked' });
});

app.get('/api/analytics', (req, res) => {
  res.json(analytics);
});
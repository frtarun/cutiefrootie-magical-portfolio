const showcaseProjects = require('../data/showcaseProjects');
const tutorialVideos = require('../data/tutorialVideos');
const nodemailer = require('nodemailer');

// Email transporter configuration
const transporter = process.env.SMTP_HOST ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) : null;

exports.getShowcaseProjects = (req, res) => {
  try {
    res.json(showcaseProjects);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTutorialVideos = (req, res) => {
  try {
    res.json(tutorialVideos);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.handleContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    // Log the submission
    console.log('\nNew Contact Form Submission:');
    console.log('------------------------');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('------------------------\n');

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!transporter) {
      console.log('Email not configured - logging message only');
      return res.status(202).json({
        status: 'accepted',
        info: 'Email service not configured; message logged'
      });
    }

    // Send email
    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `Portfolio Contact Form: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p><small>Reply to: ${email}</small></p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    res.json({ 
      status: 'success',
      message: 'Message sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Failed to send message',
      details: error.message
    });
  }
};
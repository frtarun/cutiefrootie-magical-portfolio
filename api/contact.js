export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Send email using a webhook service like Formspree or EmailJS
    const emailData = {
      to: 'cutiefrootiedev@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <pre>${message}</pre>
      `
    };

    // For now, just log the email data
    console.log('Email would be sent:', emailData);
    
    return res.status(200).json({ 
      status: 'success', 
      message: 'Thank you for your message! I\'ll get back to you soon.' 
    });
  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
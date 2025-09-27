export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Use Formspree for email sending (free service)
    const response = await fetch('https://formspree.io/f/xdkogqpw', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        message,
        _subject: `New Contact Form Submission from ${name}`,
      }),
    });

    if (response.ok) {
      return res.status(200).json({ 
        status: 'success', 
        message: 'Thank you for your message! I\'ll get back to you soon.' 
      });
    } else {
      throw new Error('Failed to send email');
    }
  } catch (error) {
    console.error('Error processing contact form:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // For now, just log the message and return success
  console.log('Contact form submission:', { name, email, message });
  
  return res.status(200).json({ 
    status: 'success', 
    message: 'Thank you for your message! I\'ll get back to you soon.' 
  });
}
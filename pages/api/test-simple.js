export default async function handler(req, res) {
  try {
    // Simple test without database
    res.status(200).json({ 
      message: 'API is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'API error',
      error: error.message
    });
  }
}

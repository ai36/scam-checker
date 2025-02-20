const axios = require('axios');

module.exports = async (req, res) => {
  // Разрешаем только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  // Проверка наличия URL
  if (!url) {
    return res.status(400).json({ error: 'URL not provided' });
  }

  // Проверка наличия API-ключа в переменных окружения
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  if (!GOOGLE_API_KEY) {
    console.error('Google API Key is not set in environment variables.');
    return res.status(500).json({ error: 'Internal Server Error: API Key is missing.' });
  }

  // Google Safe Browsing API v4
  const GOOGLE_API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;

  const requestBody = {
    client: {
      clientId: 'scam-checker',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }],
    },
  };

  try {
    const response = await axios.post(GOOGLE_API_URL, requestBody);
    const result = response.data;

    if (result && result.matches) {
      return res.json({ safe: false, threats: result.matches });
    } else {
      return res.json({ safe: true });
    }
  } catch (error) {
    console.error('Error checking URL:', error.message);
    return res.status(500).json({ error: 'Error checking URL' });
  }
};
// api/check-url.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
router.use(express.json());

// Обработка POST-запроса: URL ожидается в теле запроса
router.post("/", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL not provided in body" });
  }
  return await checkUrl(url, res);
});

// Обработка GET-запроса: URL ожидается в query-параметрах
router.get("/", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "URL not provided in query" });
  }
  return await checkUrl(url, res);
});

async function checkUrl(url, res) {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
  if (!GOOGLE_API_KEY) {
    console.error("Google API Key is missing");
    return res
      .status(500)
      .json({ error: "Internal Server Error: Missing API Key" });
  }

  const GOOGLE_API_URL = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;

  const requestBody = {
    client: {
      clientId: "scam-checker",
      clientVersion: "1.0.0",
    },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url }],
    },
  };

  console.log("Google API request body:", requestBody);

  try {
    const response = await fetch(GOOGLE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    console.log("Google API response:", data);
    if (data.matches) {
      return res.status(200).json({ safe: false, threats: data.matches });
    } else {
      return res.status(200).json({ safe: true });
    }
  } catch (error) {
    console.error("Error checking URL:", error);
    return res.status(500).json({ error: "Error checking URL: " + error.message });
  }
}

export default router;

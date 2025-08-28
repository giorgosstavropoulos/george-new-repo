// Minimal Express server to create a Supabase Storage bucket using service role key
// Usage: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment and run: node create-bucket-server.js

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Simple CORS headers so browsers (including Codespaces forwarded ports) can call this endpoint
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const serviceConfigPresent = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
if (!serviceConfigPresent) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. The server will run but /create-bucket will return an error until configured.');
}

app.post('/create-bucket', async (req, res) => {
  if (!serviceConfigPresent) {
    res.status(500).send('Server not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables to enable bucket creation.');
    return;
  }
  try {
    const url = `${SUPABASE_URL}/storage/v1/bucket`;
    const body = JSON.stringify({ name: 'event-images', public: true });
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body
    });
    const text = await r.text();
    if (!r.ok) {
      res.status(r.status).send(text);
      return;
    }
    res.status(201).send(text);
  } catch (err) {
    res.status(500).send(err.message || String(err));
  }
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`Bucket-creator server listening on http://localhost:${port}`));

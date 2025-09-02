import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const staticDir = path.join(__dirname, 'dist');
app.use(express.static(staticDir));

// All other requests serve index.html so client-side routing works
app.get('*', (req, res) => {
  res.sendFile(path.join(staticDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

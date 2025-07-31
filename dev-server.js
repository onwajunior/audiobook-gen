const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Import and setup API routes directly
const generateSpeech = require('./api/generate-speech.js').default;
const audioHandler = require('./api/audio/[filename].js').default;
const healthHandler = require('./api/health.js').default;

// API routes
app.post('/api/generate-speech', (req, res) => {
  generateSpeech(req, res);
});

app.get('/api/audio/:filename', (req, res) => {
  req.query = { filename: req.params.filename };
  audioHandler(req, res);
});

app.get('/api/health', (req, res) => {
  healthHandler(req, res);
});

// Proxy frontend requests to Vite dev server
app.use('/', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  ws: true,
}));

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`🎤 API endpoints available at http://localhost:${PORT}/api/`);
}); 
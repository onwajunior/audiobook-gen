import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configuration
const MAX_TEXT_LENGTH = 4000;
const VOICE = 'nova';
const MODEL = 'tts-1-hd';

// In-memory storage for development (same as serverless function)
const audioCache = new Map();

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const timestamp = new Date().toISOString();

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        status: 'error',
        timestamp,
        openaiConnected: false,
        message: 'OpenAI API key not configured'
      });
    }

    // Test connectivity
    await openai.models.list();

    res.json({
      status: 'ok',
      timestamp,
      openaiConnected: true,
      message: 'All systems operational'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      openaiConnected: false,
      message: 'OpenAI API connectivity issue'
    });
  }
});

// Generate speech endpoint
app.post('/api/generate-speech', async (req, res) => {
  try {
    const { text } = req.body;

    // Validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text is required and must be a string.'
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Text cannot be empty.'
      });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Text is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`
      });
    }

    // Generate audio
    console.log(`Generating speech for ${text.length} characters...`);
    
    const mp3Response = await openai.audio.speech.create({
      model: MODEL,
      voice: VOICE,
      input: text.trim(),
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    console.log(`Generated audio: ${buffer.length} bytes`);

    // Store audio temporarily
    const audioId = uuidv4();
    const filename = `speech_${audioId}.mp3`;
    
    audioCache.set(filename, {
      buffer,
      timestamp: Date.now(),
      contentType: 'audio/mpeg'
    });

    // Cleanup old files
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [key, value] of audioCache.entries()) {
      if (value.timestamp < oneHourAgo) {
        audioCache.delete(key);
      }
    }

    res.json({
      success: true,
      audioUrl: `/api/audio/${filename}`,
      filename
    });

  } catch (error) {
    console.error('TTS Generation Error:', error);
    
    if (error.message?.includes('API key')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API configuration.'
      });
    }
    
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate speech. Please try again.'
    });
  }
});

// Serve audio files
app.get('/api/audio/:filename', (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename
    if (!filename.match(/^speech_[a-f0-9-]+\.mp3$/)) {
      return res.status(400).json({
        error: 'Invalid filename format.'
      });
    }

    const audioData = audioCache.get(filename);
    if (!audioData) {
      return res.status(404).json({
        error: 'Audio file not found or expired.'
      });
    }

    // Set headers
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioData.buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    res.send(audioData.buffer);

  } catch (error) {
    console.error('Audio serving error:', error);
    res.status(500).json({
      error: 'Failed to serve audio file.'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`🎤 API endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Generate: POST http://localhost:${PORT}/api/generate-speech`);
  console.log(`   Audio: GET http://localhost:${PORT}/api/audio/{filename}`);
  console.log('');
  console.log('💡 Start the React frontend with: npm run dev');
}); 
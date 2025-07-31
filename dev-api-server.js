import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const MAX_TEXT_LENGTH = 4000;
const DEFAULT_VOICE = 'nova';
const DEFAULT_MODEL = 'tts-1-hd';
const AVAILABLE_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

// In-memory audio storage for development
const audioCache = new Map();

// Health endpoint
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

    try {
      await openai.models.list();
      res.status(200).json({
        status: 'ok',
        timestamp,
        openaiConnected: true,
        message: 'All systems operational'
      });
    } catch (openaiError) {
      console.error('OpenAI connectivity test failed:', openaiError);
      res.status(503).json({
        status: 'error',
        timestamp,
        openaiConnected: false,
        message: 'OpenAI API connectivity issue'
      });
    }
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Internal server error'
    });
  }
});

// Generate speech endpoint
app.post('/api/generate-speech', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error. Please try again later.'
      });
    }

    const { text, voice = DEFAULT_VOICE, language = 'en' } = req.body;

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

    if (!AVAILABLE_VOICES.includes(voice)) {
      return res.status(400).json({
        success: false,
        error: `Invalid voice. Available voices: ${AVAILABLE_VOICES.join(', ')}`
      });
    }

    const audioId = uuidv4();
    const filename = `speech_${voice}_${language}_${audioId}.mp3`;

    console.log(`Generating speech: ${text.length} chars, voice: ${voice}, language: ${language}`);

    let finalText = text.trim();
    let translatedText = null;

    // Translate text if language is not English
    if (language !== 'en' && language !== 'english') {
      try {
        console.log(`Translating text to ${language}...`);
        
        const translationResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional translator. Translate the given text to ${language}. Only return the translated text, nothing else.`
            },
            {
              role: 'user',
              content: text.trim()
            }
          ],
          max_tokens: 2000,
          temperature: 0.3,
        });

        translatedText = translationResponse.choices[0]?.message?.content?.trim();
        if (translatedText) {
          finalText = translatedText;
          console.log(`Translation successful: ${translatedText.substring(0, 100)}...`);
        }
      } catch (translationError) {
        console.error('Translation failed:', translationError);
        translatedText = null;
      }
    }

    // Call OpenAI TTS API
    const mp3Response = await openai.audio.speech.create({
      model: DEFAULT_MODEL,
      voice: voice,
      input: finalText,
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await mp3Response.arrayBuffer());
    console.log(`Generated audio: ${buffer.length} bytes`);

    // Store audio in cache for dev server
    audioCache.set(filename, {
      buffer,
      contentType: 'audio/mpeg'
    });

    // Convert to base64 data URL for direct usage (same as production)
    const base64Audio = buffer.toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    const response = {
      success: true,
      audioUrl: audioDataUrl,
      filename,
      voice,
      language,
      originalText: text.trim(),
      translatedText: translatedText || null
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('TTS Generation Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API configuration.'
        });
      }
      
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return res.status(429).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again later.'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate speech. Please try again.'
    });
  }
});

// Audio file endpoint (for backward compatibility)
app.get('/api/audio/:filename', (req, res) => {
  const { filename } = req.params;
  
  if (!audioCache.has(filename)) {
    return res.status(404).json({
      success: false,
      error: 'Audio file not found'
    });
  }

  const { buffer, contentType } = audioCache.get(filename);
  
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', buffer.length);
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  res.send(buffer);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`🎤 API endpoints:`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Generate: POST http://localhost:${PORT}/api/generate-speech`);
  console.log(`   Audio: GET http://localhost:${PORT}/api/audio/{filename}`);
  console.log(`💡 Start the React frontend with: npm run dev`);
}); 
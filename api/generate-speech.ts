import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { TTSRequest, TTSResponse } from './types';

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants
const MAX_TEXT_LENGTH = 4000;
const VOICE = 'nova'; // Using nova as the default voice per MVP
const MODEL = 'tts-1-hd'; // High quality model

// Declare global audio cache type
declare global {
  var audioCache: Map<string, {
    buffer: Buffer;
    timestamp: number;
    contentType: string;
  }> | undefined;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    } as TTSResponse);
    return;
  }

  try {
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY environment variable');
      res.status(500).json({
        success: false,
        error: 'Server configuration error. Please try again later.'
      } as TTSResponse);
      return;
    }

    // Parse and validate request body
    const { text }: TTSRequest = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Text is required and must be a string.'
      } as TTSResponse);
      return;
    }

    if (text.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'Text cannot be empty.'
      } as TTSResponse);
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      res.status(400).json({
        success: false,
        error: `Text is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`
      } as TTSResponse);
      return;
    }

    // Generate unique filename
    const audioId = uuidv4();
    const filename = `speech_${audioId}.mp3`;

    console.log(`Generating speech for ${text.length} characters...`);

    // Call OpenAI TTS API
    const mp3Response = await openai.audio.speech.create({
      model: MODEL,
      voice: VOICE,
      input: text.trim(),
      response_format: 'mp3',
    });

    // Convert response to buffer
    const buffer = Buffer.from(await mp3Response.arrayBuffer());

    console.log(`Generated audio: ${buffer.length} bytes`);

    // Store the audio data in global cache
    // Initialize cache if it doesn't exist
    if (!global.audioCache) {
      global.audioCache = new Map();
    }
    
    global.audioCache.set(filename, {
      buffer,
      timestamp: Date.now(),
      contentType: 'audio/mpeg'
    });

    // Clean up old files (simple cleanup for MVP)
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [key, value] of global.audioCache.entries()) {
      if (value.timestamp < oneHourAgo) {
        global.audioCache.delete(key);
      }
    }

    // Return success response
    const response: TTSResponse = {
      success: true,
      audioUrl: `/api/audio/${filename}`,
      filename
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('TTS Generation Error:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        res.status(401).json({
          success: false,
          error: 'Invalid API configuration.'
        } as TTSResponse);
        return;
      }
      
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        res.status(429).json({
          success: false,
          error: 'Service temporarily unavailable. Please try again later.'
        } as TTSResponse);
        return;
      }
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to generate speech. Please try again.'
    } as TTSResponse);
  }
} 
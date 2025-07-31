import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed. Use GET.'
    });
  }

  try {
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({
        error: 'Filename is required.'
      });
    }

    // Validate filename format (security check)
    if (!filename.match(/^speech_[a-f0-9-]+\.mp3$/)) {
      return res.status(400).json({
        error: 'Invalid filename format.'
      });
    }

    // Get audio data from temporary storage
    global.audioCache = global.audioCache || new Map();
    const audioData = global.audioCache.get(filename);

    if (!audioData) {
      return res.status(404).json({
        error: 'Audio file not found or expired.'
      });
    }

    // Set proper headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioData.buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Accept-Ranges', 'bytes');
    
    // Set download filename
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Stream the audio file
    return res.status(200).send(audioData.buffer);

  } catch (error) {
    console.error('Audio serving error:', error);
    return res.status(500).json({
      error: 'Failed to serve audio file.'
    });
  }
} 
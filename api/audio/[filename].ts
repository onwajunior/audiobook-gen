import { VercelRequest, VercelResponse } from '@vercel/node';

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
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({
      error: 'Method not allowed. Use GET.'
    });
    return;
  }

  try {
    const { filename } = req.query;

    if (!filename || typeof filename !== 'string') {
      res.status(400).json({
        error: 'Filename is required.'
      });
      return;
    }

    // Validate filename format (security check)
    if (!filename.match(/^speech_[a-f0-9-]+\.mp3$/)) {
      res.status(400).json({
        error: 'Invalid filename format.'
      });
      return;
    }

    // Get audio data from temporary storage
    const audioData = global.audioCache?.get(filename);

    if (!audioData) {
      res.status(404).json({
        error: 'Audio file not found or expired.'
      });
      return;
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

    // Stream the audio file
    res.status(200).send(audioData.buffer);

  } catch (error) {
    console.error('Audio serving error:', error);
    res.status(500).json({
      error: 'Failed to serve audio file.'
    });
  }
} 
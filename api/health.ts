import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';
import { HealthResponse } from './types';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Allow GET and OPTIONS requests
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    res.status(405).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Method not allowed. Use GET.'
    } as HealthResponse);
    return;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const timestamp = new Date().toISOString();

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      res.status(500).json({
        status: 'error',
        timestamp,
        openaiConnected: false,
        message: 'OpenAI API key not configured'
      } as HealthResponse);
      return;
    }

    // Test OpenAI connectivity with a minimal request
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      // Make a simple API call to test connectivity
      // We'll use the models endpoint as it's lightweight
      await openai.models.list();

      res.status(200).json({
        status: 'ok',
        timestamp,
        openaiConnected: true,
        message: 'All systems operational'
      } as HealthResponse);

    } catch (openaiError) {
      console.error('OpenAI connectivity test failed:', openaiError);
      
      res.status(503).json({
        status: 'error',
        timestamp,
        openaiConnected: false,
        message: 'OpenAI API connectivity issue'
      } as HealthResponse);
    }

  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Internal server error'
    } as HealthResponse);
  }
} 
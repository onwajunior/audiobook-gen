import axios from 'axios';
import { TTSRequest, TTSResponse, HealthResponse } from './types';

// Configure axios defaults
const api = axios.create({
  timeout: 30000, // 30 seconds timeout for TTS generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Base URL for API calls - use development server on port 3001
const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

/**
 * Generate speech from text using OpenAI TTS API
 */
export const generateSpeech = async (text: string): Promise<TTSResponse> => {
  try {
    const request: TTSRequest = { text };
    
    const response = await api.post<TTSResponse>(
      `${API_BASE}/api/generate-speech`,
      request
    );

    return response.data;
  } catch (error) {
    console.error('Failed to generate speech:', error);
    
    if (axios.isAxiosError(error)) {
      // Handle HTTP errors
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try with shorter text.');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Service is busy. Please try again in a moment.');
      }
      
      if (error.response && error.response.status >= 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    
    throw new Error('Failed to generate speech. Please check your connection and try again.');
  }
};

/**
 * Download audio file
 */
export const downloadAudio = async (audioUrl: string, filename: string): Promise<void> => {
  try {
    const response = await api.get(`${API_BASE}${audioUrl}`, {
      responseType: 'blob',
      timeout: 15000, // 15 seconds for download
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'audio/mpeg' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download audio:', error);
    throw new Error('Failed to download audio file. Please try again.');
  }
};

/**
 * Get audio file URL for playing
 */
export const getAudioUrl = (audioUrl: string): string => {
  return `${API_BASE}${audioUrl}`;
};

/**
 * Check API health status
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    const response = await api.get<HealthResponse>(
      `${API_BASE}/api/health`,
      { timeout: 5000 }
    );
    
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw new Error('Unable to connect to API service.');
  }
}; 
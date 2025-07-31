import axios from 'axios';
import { TTSRequest, TTSResponse, HealthResponse, Voice, Language } from './types';

// Configure axios defaults
const api = axios.create({
  timeout: 30000, // 30 seconds timeout for TTS generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Base URL for API calls
// In production (Vercel), use same domain. In development, use localhost:3001
const API_BASE = process.env.NODE_ENV === 'production' 
  ? '' // Same domain for Vercel deployment
  : 'http://localhost:3001'; // Local development server

// Available voices
export const AVAILABLE_VOICES: Voice[] = [
  { id: 'nova', name: 'Nova', description: 'Young, energetic female voice', gender: 'female' },
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice', gender: 'neutral' },
  { id: 'echo', name: 'Echo', description: 'Male voice with clear pronunciation', gender: 'male' },
  { id: 'fable', name: 'Fable', description: 'British accent, expressive', gender: 'female' },
  { id: 'onyx', name: 'Onyx', description: 'Deep, authoritative male voice', gender: 'male' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft, warm female voice', gender: 'female' },
];

// Available languages  
export const AVAILABLE_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', flag: '🇳🇬' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

/**
 * Generate speech from text using OpenAI TTS API
 */
export const generateSpeech = async (
  text: string, 
  voice: string = 'nova', 
  language: string = 'en'
): Promise<TTSResponse> => {
  try {
    const request: TTSRequest = { text, voice, language };
    
    console.log(`Making TTS request to: ${API_BASE}/api/generate-speech`);
    console.log(`Voice: ${voice}, Language: ${language}`);
    
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
      
      // Log the full error for debugging
      console.error('Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    
    throw new Error('Failed to generate speech. Please check your connection and try again.');
  }
};

/**
 * Download audio file - now handles both data URLs and file URLs
 */
export const downloadAudio = async (audioUrl: string, filename: string): Promise<void> => {
  try {
    // Check if it's a data URL (base64 encoded)
    if (audioUrl.startsWith('data:audio/mpeg;base64,')) {
      // Convert data URL to blob and download
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } else {
      // Handle regular file URLs (for local development)
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
    }
  } catch (error) {
    console.error('Failed to download audio:', error);
    throw new Error('Failed to download audio file. Please try again.');
  }
};

/**
 * Get audio file URL for playing - now handles data URLs
 */
export const getAudioUrl = (audioUrl: string): string => {
  // If it's already a data URL, return as-is
  if (audioUrl.startsWith('data:audio/mpeg;base64,')) {
    return audioUrl;
  }
  // Otherwise, construct the full URL (for local development)
  return `${API_BASE}${audioUrl}`;
};

/**
 * Check API health status
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  try {
    console.log(`Checking health at: ${API_BASE}/api/health`);
    
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
export interface TTSRequest {
  text: string;
  voice?: string;
  language?: string;
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  filename?: string;
  error?: string;
  translatedText?: string | null;
  originalText?: string;
  voice?: string;
  language?: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  openaiConnected?: boolean;
  message?: string;
}

export interface AudioMetadata {
  filename: string;
  contentType: string;
  size?: number;
}

export interface Voice {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
} 
// API Request/Response types
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

// Component state types
export interface AppState {
  text: string;
  isGenerating: boolean;
  audioUrl: string | null;
  filename: string | null;
  error: string | null;
  characterCount: number;
  selectedVoice: string;
  selectedLanguage: string;
  translatedText: string | null;
  showTranslation: boolean;
}

// Audio player state
export interface AudioPlayerState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  isLoading: boolean;
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
// API Request/Response types
export interface TTSRequest {
  text: string;
}

export interface TTSResponse {
  success: boolean;
  audioUrl?: string;
  filename?: string;
  error?: string;
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
}

// Audio player state
export interface AudioPlayerState {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  isLoading: boolean;
} 
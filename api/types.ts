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

export interface AudioMetadata {
  filename: string;
  contentType: string;
  size?: number;
} 
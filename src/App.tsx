import React, { useState, useRef, useEffect } from 'react';
import { generateSpeech, downloadAudio, getAudioUrl } from './api';
import { AppState } from './types';
import './App.css';

const MAX_CHARACTERS = 4000;

function App() {
  const [state, setState] = useState<AppState>({
    text: '',
    isGenerating: false,
    audioUrl: null,
    filename: null,
    error: null,
    characterCount: 0,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update character count when text changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      characterCount: prev.text.length,
    }));
  }, [state.text]);

  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Prevent input beyond max characters
    if (newText.length <= MAX_CHARACTERS) {
      setState(prev => ({
        ...prev,
        text: newText,
        error: null, // Clear any previous errors
      }));
    }
  };

  // Generate speech from text
  const handleGenerateSpeech = async () => {
    if (!state.text.trim()) {
      setState(prev => ({
        ...prev,
        error: 'Please enter some text to convert to speech.',
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isGenerating: true,
      error: null,
      audioUrl: null,
      filename: null,
    }));

    try {
      const response = await generateSpeech(state.text.trim());
      
      if (response.success && response.audioUrl && response.filename) {
        setState(prev => ({
          ...prev,
          audioUrl: response.audioUrl,
          filename: response.filename,
          isGenerating: false,
        }));

        // Auto-play the generated audio after a short delay
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().catch(error => {
              console.log('Auto-play prevented by browser:', error);
            });
          }
        }, 500);
      } else {
        throw new Error(response.error || 'Unknown error occurred');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate speech',
      }));
    }
  };

  // Handle download button click
  const handleDownload = async () => {
    if (state.audioUrl && state.filename) {
      try {
        await downloadAudio(state.audioUrl, state.filename);
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to download audio',
        }));
      }
    }
  };

  // Get character count color based on usage
  const getCharacterCountColor = () => {
    const percentage = (state.characterCount / MAX_CHARACTERS) * 100;
    if (percentage >= 90) return '#ef4444'; // Red
    if (percentage >= 75) return '#f59e0b'; // Orange  
    return '#6b7280'; // Gray
  };

  // Check if generate button should be disabled
  const isGenerateDisabled = state.isGenerating || !state.text.trim();

  return (
    <div className="app">
      <div className="container">
        {/* Header Section */}
        <header className="header">
          <h1 className="title">
            🎙️ Text-to-Speech Generator
          </h1>
          <div className="subtitle">
            Enter your text below and generate beautiful AI speech...
          </div>
        </header>

        {/* Main Content */}
        <main className="main">
          {/* Text Input Section */}
          <div className="input-section">
            <textarea
              ref={textareaRef}
              className="text-input"
              placeholder="Type or paste your text here..."
              value={state.text}
              onChange={handleTextChange}
              disabled={state.isGenerating}
              maxLength={MAX_CHARACTERS}
            />
            <div className="character-counter">
              <span style={{ color: getCharacterCountColor() }}>
                {state.characterCount} / {MAX_CHARACTERS} chars
              </span>
            </div>
          </div>

          {/* Generate Button */}
          <div className="button-section">
            <button
              className={`generate-button ${state.isGenerating ? 'loading' : ''}`}
              onClick={handleGenerateSpeech}
              disabled={isGenerateDisabled}
            >
              {state.isGenerating ? (
                <>⏳ Generating...</>
              ) : (
                <>🎤 Generate Speech</>
              )}
            </button>
          </div>

          {/* Error Display */}
          {state.error && (
            <div className="error-message">
              ⚠️ {state.error}
            </div>
          )}

          {/* Audio Preview Section */}
          <div className="audio-section">
            <div className="audio-header">Audio Preview</div>
            
            {!state.audioUrl && !state.isGenerating && (
              <div className="audio-placeholder">
                ⚪ No audio generated yet
              </div>
            )}

            {state.isGenerating && (
              <div className="audio-loading">
                🔄 Creating your audio...
              </div>
            )}

            {state.audioUrl && (
              <div className="audio-player">
                <audio
                  ref={audioRef}
                  className="audio-element"
                  controls
                  src={getAudioUrl(state.audioUrl)}
                >
                  Your browser does not support the audio element.
                </audio>
                
                <button
                  className="download-button"
                  onClick={handleDownload}
                >
                  📥 Download MP3
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App; 
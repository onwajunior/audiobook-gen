# Text-to-Speech Generator - Project Scope

## Project Overview
A web-based Text-to-Speech (TTS) generator that converts user input text into natural-sounding audio using OpenAI's TTS API. The application focuses on backend API integration while providing a clean, user-friendly React frontend.

## Core Features

### 1. Text Input & Processing
- **Text Input Area**: Large textarea for users to paste or type text (up to 4,096 characters - OpenAI TTS limit)
- **Character Counter**: Real-time character count with visual indicator approaching limit
- **Text Validation**: Client and server-side validation for text length and content
- **Text Preprocessing**: Basic text cleaning and formatting for optimal TTS processing

### 2. Voice Selection
- **Voice Options**: Support for all OpenAI TTS voices:
  - `alloy` - Neutral, balanced voice
  - `echo` - Male voice with clear pronunciation
  - `fable` - British accent, expressive
  - `onyx` - Deep, authoritative male voice
  - `nova` - Young, energetic female voice
  - `shimmer` - Soft, warm female voice
- **Voice Preview**: Sample audio clips for each voice option
- **Voice Description**: Brief description of each voice character

### 3. Audio Generation & Download
- **High-Quality Output**: Generate MP3 files using OpenAI's `tts-1-hd` model
- **Progress Indicators**: Loading states during audio generation
- **Audio Player**: Built-in player to preview generated audio before download
- **Download Functionality**: Direct download of MP3 files with meaningful filenames
- **File Management**: Temporary storage and cleanup of generated audio files

### 4. User Experience
- **Responsive Design**: Mobile-friendly interface
- **Error Handling**: Comprehensive error messages for API failures, validation errors
- **Rate Limiting**: Prevent abuse while maintaining good UX
- **Loading States**: Visual feedback during API calls

## Technical Requirements

### Backend (Node.js + Express)
- **Framework**: Express.js with TypeScript
- **API Integration**: OpenAI TTS API client
- **File Handling**: Temporary file storage and serving
- **Environment Management**: Secure API key handling
- **CORS**: Proper CORS configuration for frontend
- **Error Handling**: Comprehensive error middleware
- **Logging**: Request/response logging for debugging
- **Validation**: Input validation middleware

### Frontend (React)
- **Framework**: React 18 with TypeScript
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Axios for API communication
- **UI Components**: Clean, modern interface
- **File Handling**: File download functionality
- **Audio Player**: HTML5 audio player integration
- **Responsive Design**: CSS Grid/Flexbox for layout

### Development Tools
- **Package Manager**: npm or yarn
- **Build Tools**: Vite for frontend, Node.js for backend
- **Environment Variables**: dotenv for configuration
- **Code Quality**: ESLint + Prettier
- **Type Safety**: TypeScript throughout

## API Endpoints

### POST `/api/generate-speech`
- **Purpose**: Convert text to speech
- **Request Body**:
  ```json
  {
    "text": "string (1-4096 characters)",
    "voice": "alloy|echo|fable|onyx|nova|shimmer",
    "model": "tts-1-hd"
  }
  ```
- **Response**: Audio file (MP3) or error message
- **Rate Limiting**: Implement reasonable limits

### GET `/api/voices`
- **Purpose**: Retrieve available voice options with metadata
- **Response**:
  ```json
  {
    "voices": [
      {
        "id": "alloy",
        "name": "Alloy",
        "description": "Neutral, balanced voice",
        "gender": "neutral"
      }
    ]
  }
  ```

### GET `/api/health`
- **Purpose**: Health check endpoint
- **Response**: Service status and OpenAI API connectivity

## User Flow

1. **Landing Page**: User arrives at clean, intuitive interface
2. **Text Input**: User pastes or types text in textarea
3. **Voice Selection**: User selects preferred voice from dropdown/radio buttons
4. **Generate Audio**: User clicks "Generate Speech" button
5. **Loading State**: Progress indicator while API processes request
6. **Audio Preview**: Generated audio plays automatically with controls
7. **Download**: User can download MP3 file with descriptive filename
8. **Error Handling**: Clear error messages for any failures

## File Structure
```
text-to-speech-generator/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── app.ts
│   ├── temp/              # Temporary audio files
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── vercel.json           # Vercel deployment config
```

## Deployment (Vercel)

### Backend Deployment (Serverless Functions)
- **Environment Variables**: 
  - `OPENAI_API_KEY`
  - `NODE_ENV`
- **API Routes**: Deploy as Vercel serverless functions in `/api` directory
- **Runtime**: Node.js 18.x
- **Health Check**: `/api/health` endpoint
- **Automatic deployments**: GitHub integration

### Frontend Deployment
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (Vite) or `build` (Create React App)
- **Static Site**: Automatic CDN distribution
- **Environment Variables**: Backend API URL (same domain for serverless)

### Domain & SSL
- Custom domain configuration
- Automatic SSL certificate
- Global CDN distribution
- Preview deployments for pull requests

## Security Considerations
- **API Key Protection**: Never expose OpenAI API key to frontend
- **Input Validation**: Sanitize and validate all user inputs
- **Rate Limiting**: Prevent API abuse
- **CORS**: Proper CORS configuration
- **File Cleanup**: Automatic cleanup of temporary audio files
- **Error Handling**: Don't expose internal errors to users

## Performance Optimization
- **Caching**: Cache voice metadata
- **File Cleanup**: Scheduled cleanup of temporary files
- **Compression**: Gzip compression for API responses
- **Connection Pooling**: Efficient HTTP client configuration

## Success Metrics
- **Functionality**: Users can successfully generate and download TTS audio
- **Performance**: Audio generation within 10 seconds for typical text
- **Reliability**: 99%+ uptime and proper error handling
- **User Experience**: Intuitive interface with clear feedback

## Future Enhancements (Out of Scope)
- User accounts and saved audio files
- Batch processing for multiple texts
- SSML (Speech Synthesis Markup Language) support
- Audio format options (WAV, OGG)
- Custom voice training
- Audio editing capabilities

## Learning Objectives
- OpenAI API integration and authentication
- File handling and streaming in Node.js
- React state management and user interactions
- Backend-frontend communication patterns
- Cloud deployment with Railway
- Error handling and user experience design 
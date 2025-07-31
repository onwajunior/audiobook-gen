# Text-to-Speech Generator - MVP

## MVP Goal
**User pastes text → clicks button → downloads beautiful AI-generated audio in under 30 seconds**

## Core Magic ✨
The MVP creates a magical experience through **simplicity and quality**:
- Paste any text and get studio-quality audio instantly
- Zero configuration - just works out of the box
- Beautiful, natural-sounding AI voice
- Fast, seamless experience

## MVP Features (Keep It Simple)

### 1. Single Text-to-Speech Endpoint
- **One API endpoint**: `POST /api/generate-speech`
- **Input**: Plain text (up to 4,000 characters)
- **Output**: High-quality MP3 file
- **Default Voice**: `nova` (warm, clear female voice)
- **Model**: `tts-1-hd` for best quality

### 2. Minimal Frontend
- **Single Page**: Clean, focused interface
- **Large Textarea**: For text input with character counter
- **One Button**: "Generate Speech" 
- **Audio Player**: Preview generated audio
- **Download Button**: Download MP3 file
- **Loading State**: Simple spinner during generation

### 3. Essential Backend
- **Express Server**: Minimal setup with TypeScript
- **OpenAI Integration**: Direct API calls to TTS
- **File Handling**: Temporary MP3 storage and serving
- **Error Handling**: Basic error responses
- **CORS**: Allow frontend requests

## MVP File Structure
```
tts-mvp/
├── api/                     # Vercel serverless functions
│   ├── generate-speech.ts   # Main TTS endpoint
│   ├── audio/
│   │   └── [filename].ts    # Audio file serving
│   └── health.ts            # Health check endpoint
├── src/
│   ├── App.tsx              # Main React component
│   ├── api.ts               # Backend API calls
│   └── main.tsx             # React entry point
├── public/                  # Static assets
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json              # Vercel configuration
├── README.md
└── .env.example
```

## MVP API Design

### POST `/api/generate-speech`
```typescript
// Request
{
  "text": "Hello world, this is a test of the text-to-speech system."
}

// Response (Success)
{
  "success": true,
  "audioUrl": "/api/audio/abc123.mp3",
  "filename": "speech_abc123.mp3"
}

// Response (Error)
{
  "success": false,
  "error": "Text is too long. Maximum 4000 characters."
}
```

### GET `/api/audio/[filename]`
- Serves generated MP3 files as Vercel serverless function
- Temporary storage with automatic cleanup
- Proper headers for audio streaming

## MVP User Flow
1. **Land on page** → See clean interface with textarea
2. **Paste text** → Character counter updates in real-time
3. **Click "Generate Speech"** → Button shows loading spinner
4. **Wait 3-10 seconds** → Audio generates in background
5. **Auto-play preview** → Audio plays automatically when ready
6. **Download MP3** → One-click download with meaningful filename

## MVP Technical Implementation

### Backend Dependencies (Serverless Functions)
```json
{
  "openai": "^4.0.0",
  "uuid": "^9.0.0",
  "@vercel/node": "^3.0.0"
}
```

### Frontend Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "axios": "^1.6.0"
}
```

### Environment Variables
```env
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=production
```

## MVP Success Criteria
- [ ] User can input text and generate audio
- [ ] Audio generation completes in under 30 seconds
- [ ] Generated audio is high quality and natural sounding
- [ ] User can preview audio before downloading
- [ ] User can download MP3 file
- [ ] Basic error handling for common issues
- [ ] Clean, intuitive interface

## What's NOT in MVP (Save for Later)
- ❌ Multiple voice options
- ❌ Voice previews or samples
- ❌ User accounts or history
- ❌ Rate limiting or quotas
- ❌ Advanced error handling
- ❌ Audio editing features
- ❌ Batch processing
- ❌ Custom styling/themes
- ❌ Mobile optimization
- ❌ Analytics or monitoring
- ❌ Database integration
- ❌ User authentication

## MVP Development Order

### Phase 1: Backend Core (Day 1)
1. Set up Vercel serverless functions with TypeScript
2. Install and configure OpenAI client
3. Create single TTS API endpoint (`/api/generate-speech`)
4. Test with curl/Postman

### Phase 2: File Handling (Day 1)
1. Generate unique filenames for audio files
2. Use Vercel's temporary file storage for MP3s
3. Create audio serving endpoint (`/api/audio/[filename]`)
4. Handle file cleanup and streaming

### Phase 3: Frontend Core (Day 2)
1. Create React app with Vite
2. Build single-page interface
3. Connect to backend API
4. Test end-to-end flow

### Phase 4: Polish (Day 2)
1. Add loading states
2. Improve error messages
3. Style the interface
4. Test edge cases

## MVP Deployment
- **Vercel**: Git-based deployments with automatic CI/CD
- **Serverless**: Backend APIs deployed as serverless functions
- **Environment**: Environment variables via Vercel dashboard
- **Domain**: Vercel's provided domain (.vercel.app) for MVP
- **Monitoring**: Vercel Analytics and Function logs
- **Preview Deployments**: Automatic previews for every pull request

## Post-MVP Additions (In Priority Order)
1. **Voice Selection**: Add 2-3 popular voices
2. **Better UI**: Improve styling and responsiveness
3. **Rate Limiting**: Prevent abuse
4. **Error Handling**: More detailed error messages
5. **File Management**: Better cleanup and storage
6. **Performance**: Optimize API calls and caching

## Success Metrics for MVP
- **Technical**: API responds within 10 seconds
- **User Experience**: Complete flow works without errors
- **Quality**: Generated audio sounds natural and clear
- **Simplicity**: Non-technical users can use it immediately

The MVP prioritizes the magical moment: **text goes in, beautiful audio comes out**. Everything else is secondary. 
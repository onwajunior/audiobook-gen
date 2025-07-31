# 🎙️ Text-to-Speech Generator

Generate beautiful AI speech from text using OpenAI's advanced TTS technology. A modern web application built with React and Vercel serverless functions.

## ✨ Features

- **High-Quality Speech**: Uses OpenAI's `tts-1-hd` model with the natural-sounding `nova` voice
- **Real-time Character Count**: Shows character usage up to 4,000 character limit
- **Instant Preview**: Auto-plays generated audio for immediate feedback
- **Easy Download**: One-click MP3 download with meaningful filenames
- **Responsive Design**: Works beautifully on desktop and mobile devices
- **Error Handling**: Comprehensive error messages and loading states

## 🚀 Live Demo

*Add your deployed Vercel URL here after deployment*

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Vercel Serverless Functions + Node.js
- **API**: OpenAI Text-to-Speech API
- **Styling**: Modern CSS with responsive design
- **Deployment**: Vercel (serverless architecture)

## 📋 Prerequisites

- Node.js 18+ 
- OpenAI API key with TTS access
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd text-to-speech-generator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

**Important**: Never commit your `.env.local` file. Add it to `.gitignore`.

### 4. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Generate a new API key
4. Add the key to your `.env.local` file

### 5. Local Development
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📖 Usage

1. **Enter Text**: Type or paste your text (up to 4,000 characters)
2. **Generate Speech**: Click the "🎤 Generate Speech" button
3. **Preview Audio**: Audio plays automatically when ready
4. **Download**: Click "📥 Download MP3" to save the file

## 🌐 Deployment on Vercel

### Option 1: Deploy with Git (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables

3. **Add Environment Variables** in Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key

4. **Deploy**: Vercel will automatically build and deploy

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   vercel
   ```

3. **Add Environment Variables**:
   ```bash
   vercel env add OPENAI_API_KEY
   ```

## 🏗️ Project Structure

```
text-to-speech-generator/
├── api/                     # Vercel serverless functions
│   ├── generate-speech.ts   # Main TTS endpoint
│   ├── audio/
│   │   └── [filename].ts    # Audio file serving
│   ├── health.ts            # Health check endpoint
│   └── types.ts             # API type definitions
├── src/                     # React frontend
│   ├── App.tsx              # Main React component
│   ├── App.css              # Styling
│   ├── api.ts               # API client functions
│   ├── types.ts             # Frontend type definitions
│   └── main.tsx             # React entry point
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── vercel.json             # Vercel deployment configuration
└── README.md               # This file
```

## 🔌 API Endpoints

### POST `/api/generate-speech`
Generate speech from text.

**Request Body**:
```json
{
  "text": "Hello world! This is a test."
}
```

**Response**:
```json
{
  "success": true,
  "audioUrl": "/api/audio/speech_abc123.mp3",
  "filename": "speech_abc123.mp3"
}
```

### GET `/api/audio/[filename]`
Serve generated audio files.

**Response**: MP3 audio file with proper headers.

### GET `/api/health`
Check API health and OpenAI connectivity.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "openaiConnected": true,
  "message": "All systems operational"
}
```

## ⚙️ Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `NODE_ENV`: Environment (development/production)

### Customization

**Voice Selection**: Change the voice in `api/generate-speech.ts`:
```typescript
const VOICE = 'nova'; // Options: alloy, echo, fable, onyx, nova, shimmer
```

**Character Limit**: Modify the limit in both frontend and backend:
```typescript
const MAX_TEXT_LENGTH = 4000; // Adjust as needed
```

**Model Quality**: Switch between models in `api/generate-speech.ts`:
```typescript
const MODEL = 'tts-1-hd'; // High quality (recommended)
// const MODEL = 'tts-1';    // Standard quality (faster)
```

## 🐛 Troubleshooting

### Common Issues

**"OpenAI API key not configured"**
- Ensure your `.env.local` file contains the correct API key
- Verify the key is valid and has TTS access

**"Failed to generate speech"**
- Check your OpenAI account has sufficient credits
- Verify the text is under 4,000 characters
- Ensure your API key has TTS permissions

**Audio not playing**
- Some browsers block auto-play; this is normal
- Users can manually click play on the audio controls

**Deployment issues**
- Ensure environment variables are set in Vercel dashboard
- Check function logs in Vercel for specific errors

### Performance Tips

- Keep text under 1,000 characters for fastest generation
- Use shorter sentences for better speech quality
- Avoid special characters that might confuse the TTS model

## 📝 Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run type-check`: Run TypeScript type checking

### Adding Features

The codebase is designed for easy extension:

1. **Multiple Voices**: Update the API to accept voice parameter
2. **User Accounts**: Add authentication and save history
3. **Batch Processing**: Process multiple texts at once
4. **SSML Support**: Add Speech Synthesis Markup Language

## 🔒 Security

- API keys are server-side only (never exposed to client)
- Input validation prevents malicious requests
- CORS properly configured for frontend access
- File serving includes security headers

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [OpenAI](https://openai.com) for the amazing TTS API
- [Vercel](https://vercel.com) for seamless serverless deployment
- [React](https://reactjs.org) and [Vite](https://vitejs.dev) for excellent development experience

---

**Built with ❤️ for learning backend API integration and modern web development** 
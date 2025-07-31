import OpenAI from 'openai';
import { config } from 'dotenv';

config({ path: '.env.local' });

async function testOpenAI() {
  console.log('🔑 Testing OpenAI API key...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not found in .env.local');
    process.exit(1);
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    // Test 1: Check API connectivity
    console.log('🌐 Testing API connectivity...');
    const models = await openai.models.list();
    console.log('✅ Connected to OpenAI API successfully');

    // Test 2: Generate a short speech sample
    console.log('🎤 Testing TTS generation...');
    const response = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'nova',
      input: 'Hello! This is a test of the text-to-speech system.',
      response_format: 'mp3',
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`✅ Speech generated successfully! Size: ${buffer.length} bytes`);
    console.log('🎉 OpenAI TTS integration is working perfectly!');
    
    return true;
  } catch (error) {
    console.error('❌ OpenAI API Error:');
    
    if (error.code === 'invalid_api_key') {
      console.error('   Invalid API key. Please check your OPENAI_API_KEY in .env.local');
    } else if (error.code === 'insufficient_quota') {
      console.error('   Insufficient quota. Please check your OpenAI account billing.');
    } else if (error.status === 429) {
      console.error('   Rate limited. Please try again in a moment.');
    } else {
      console.error('   Error details:', error.message);
    }
    
    return false;
  }
}

// Run the test
testOpenAI().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
}); 
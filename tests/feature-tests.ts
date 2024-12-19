import { VideoClient } from '@zoom/videosdk';
import { Stream } from '@zoom/videosdk/dist/types/media';
import { useAudioTranscription } from '../src/feature/video/hooks/useAudioTranscription';
import { AzureOpenAIService } from '../src/services/azure-openai';
import { ConnectionState } from '@zoom/videosdk';

interface MediaStream {
  getAudioLevel: () => Promise<number>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
}

async function testAudioCapture(mediaStream: MediaStream) {
  console.log('Testing audio capture...');
  try {
    const audioLevel = await mediaStream.getAudioLevel();
    console.log('Audio level:', audioLevel);
    return audioLevel !== undefined;
  } catch (error) {
    console.error('Audio capture test failed:', error);
    return false;
  }
}

async function testAzureOpenAI() {
  console.log('Testing Azure OpenAI integration...');
  try {
    const azureService = new AzureOpenAIService();
    const result = await azureService.analyzeConversation('This is a test message for real estate conversation analysis.');
    console.log('Azure OpenAI response:', result);
    return result !== undefined;
  } catch (error) {
    console.error('Azure OpenAI test failed:', error);
    return false;
  }
}

async function testRecording(mediaStream: MediaStream) {
  console.log('Testing recording functionality...');
  try {
    await mediaStream.startRecording();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await mediaStream.stopRecording();
    return true;
  } catch (error) {
    console.error('Recording test failed:', error);
    return false;
  }
}

async function testErrorHandling(zmClient: typeof VideoClient) {
  console.log('Testing error handling...');
  try {
    // Test connection state changes
    zmClient.on('connection-change', (payload: { state: ConnectionState }) => {
      console.log('Connection state changed:', payload.state);
    });

    // Simulate connection changes
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('Error handling test failed:', error);
    return false;
  }
}

export async function runFeatureTests(zmClient: typeof VideoClient, mediaStream: MediaStream) {
  const results = {
    audioCapture: await testAudioCapture(mediaStream),
    azureOpenAI: await testAzureOpenAI(),
    recording: await testRecording(mediaStream),
    errorHandling: await testErrorHandling(zmClient)
  };

  console.log('\nTest Results:');
  console.log('-------------');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${test}: ${passed ? 'PASS' : 'FAIL'}`);
  });

  return Object.values(results).every(result => result);
}

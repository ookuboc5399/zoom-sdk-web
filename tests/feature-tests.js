const { VideoClient } = require('@zoom/videosdk');
const { Stream } = require('@zoom/videosdk/dist/types/media');
const { AzureOpenAIService } = require('../src/services/azure-openai');
const { ConnectionState } = require('@zoom/videosdk');

async function testAudioCapture(mediaStream) {
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
    const result = await analyzeConversation('This is a test message for real estate conversation analysis.');
    console.log('Azure OpenAI response:', result);
    return result !== undefined;
  } catch (error) {
    console.error('Azure OpenAI test failed:', error);
    return false;
  }
}

async function testRecording(mediaStream) {
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

async function testErrorHandling(zmClient) {
  console.log('Testing error handling...');
  try {
    // Test connection state changes
    zmClient.emit('connection-change', { state: ConnectionState.Reconnecting });
    await new Promise(resolve => setTimeout(resolve, 1000));
    zmClient.emit('connection-change', { state: ConnectionState.Connected });
    return true;
  } catch (error) {
    console.error('Error handling test failed:', error);
    return false;
  }
}

async function runFeatureTests(zmClient, mediaStream) {
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

module.exports = {
  runFeatureTests
};

import { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Stream } from '@zoom/videosdk';
import ZoomContext from '../../../context/zoom-context';
import { useMedia } from '../../../context/media-context';
import { AzureOpenAIService } from '../../../services/azure-openai';

interface TranscriptionState {
  text: string;
  isProcessing: boolean;
  analysis: string;
  isRecording: boolean;
  error: string | null;
}

type ZoomMediaStream = {
  startAudio: () => Promise<void>;
  stopAudio: () => void;
  on: (event: string, callback: (payload: any) => void) => void;
  removeEventListener: (event: string, callback: (payload: any) => void) => void;
};

export function useAudioTranscription() {
  const { client, mediaStream } = useContext(ZoomContext);
  const { audioLevel, isAudioProcessing, performanceMetrics } = useMedia();

  const [state, setState] = useState<TranscriptionState>({
    text: '',
    isProcessing: false,
    analysis: '',
    isRecording: false,
    error: null
  });

  const audioService = useRef<AzureOpenAIService | null>(null);
  const audioBuffer = useRef<string[]>([]);
  const processingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTime = useRef<number>(0);

  const handleAudioData = useCallback((payload: { volume: number }) => {
    if (payload.volume > 0.1 && state.isRecording) {
      const currentTime = Date.now();
      const audioData = new Float32Array(1);
      audioData[0] = payload.volume;
      audioBuffer.current.push(Array.from(audioData).join(','));

      if (processingTimeout.current) {
        clearTimeout(processingTimeout.current);
      }

      processingTimeout.current = setTimeout(() => {
        processAudioBuffer();
      }, 2000);

      const latency = currentTime - startTime.current;
      startTime.current = currentTime;
    }
  }, [state.isRecording]);

  useEffect(() => {
    if (!client || !mediaStream) return;

    const zoomStream = mediaStream as unknown as ZoomMediaStream;

    const initializeAudio = async () => {
      try {
        audioService.current = new AzureOpenAIService();
        await zoomStream.startAudio();
        zoomStream.on('audio-volume-change', handleAudioData);
        startTime.current = Date.now();
      } catch (error) {
        console.error('Failed to initialize audio transcription:', error);
        setState(prev => ({ ...prev, error: 'Failed to initialize audio' }));
      }
    };

    initializeAudio();

    return () => {
      if (processingTimeout.current) {
        clearTimeout(processingTimeout.current);
      }
      zoomStream.stopAudio();
      zoomStream.removeEventListener('audio-volume-change', handleAudioData);
    };
  }, [client, mediaStream, handleAudioData]);

  const processAudioBuffer = async () => {
    if (!state.isRecording || !audioService.current) return;

    setState(prev => ({ ...prev, isProcessing: true }));
    const processStartTime = Date.now();

    try {
      const text = audioBuffer.current.join(' ');
      const analysis = await audioService.current.analyzeConversation(text);

      const processingLatency = Date.now() - processStartTime;

      setState(prev => ({
        ...prev,
        text,
        analysis,
        isProcessing: false,
        error: null
      }));

      audioBuffer.current = [];
    } catch (error) {
      console.error('Failed to process audio:', error);
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: 'Failed to process audio data',
        analysis: ''
      }));
    }
  };

  const startRecording = () => {
    setState(prev => ({ ...prev, isRecording: true, error: null }));
    audioBuffer.current = [];
    startTime.current = Date.now();
  };

  const stopRecording = () => {
    setState(prev => ({ ...prev, isRecording: false }));
    if (processingTimeout.current) {
      clearTimeout(processingTimeout.current);
    }
    processAudioBuffer();
  };

  return {
    transcription: state.text,
    analysis: state.analysis,
    isProcessing: state.isProcessing,
    audioLevel,
    performanceMetrics,
    isRecording: state.isRecording,
    error: state.error,
    startRecording,
    stopRecording
  };
}

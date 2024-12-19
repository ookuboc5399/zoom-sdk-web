import React from 'react';
import { useAudioTranscription } from '../hooks/useAudioTranscription';
import './feedback-panel.scss';

interface FeedbackPanelProps {
  className?: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ className }) => {
  const {
    transcription,
    analysis,
    isProcessing,
    audioLevel,
    performanceMetrics,
    isRecording,
    error
  } = useAudioTranscription();

  if (!isRecording && !transcription) return null;

  return (
    <div className={`feedback-panel ${className || ''}`}>
      <div className="feedback-panel__header">
        Real-time Feedback
        {isProcessing && ' (Processing...)'}
      </div>

      {error && (
        <div className="feedback-panel__error">
          {error}
        </div>
      )}

      {transcription && (
        <div className="feedback-panel__content">
          <strong>Transcription:</strong>
          <div>{transcription}</div>
        </div>
      )}

      {analysis && (
        <div className="feedback-panel__content">
          <strong>Analysis:</strong>
          <div>{analysis}</div>
        </div>
      )}

      <div className="feedback-panel__metrics">
        <div className="feedback-panel__metrics-item">
          <span>Audio Level:</span>
          <span>{audioLevel.toFixed(2)}</span>
        </div>
        <div className="feedback-panel__metrics-item">
          <span>Processing Latency:</span>
          <span>{performanceMetrics.audioProcessingLatency}ms</span>
        </div>
        <div className="feedback-panel__metrics-item">
          <span>API Latency:</span>
          <span>{performanceMetrics.apiRequestLatency}ms</span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;

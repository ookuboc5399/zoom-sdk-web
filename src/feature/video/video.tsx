import React from 'react';
import { useParams } from 'react-router-dom';
import { VideoFooter, FeedbackPanel } from './components';
import { MediaProvider, MediaContextType } from '../../context';
import './video.scss';

interface VideoProps {
  meetingId?: string;
}

const defaultMediaContext: MediaContextType = {
  audioLevel: 0,
  isAudioProcessing: false,
  processingLatency: 0,
  audioError: null,
  performanceMetrics: {
    audioProcessingLatency: 0,
    apiRequestLatency: 0,
    memoryUsage: {
      heapTotal: 0,
      heapUsed: 0,
      external: 0
    }
  }
};

const Video: React.FC<VideoProps> = ({ meetingId }) => {
  const { id } = useParams<{ id: string }>();
  const activeMeetingId = meetingId || id;

  return (
    <div className="video-container">
      <MediaProvider value={defaultMediaContext}>
        <div className="video-content">
          {/* Video content will be rendered here */}
        </div>
        <FeedbackPanel className="video-feedback-panel" />
        <VideoFooter className="video-footer" />
      </MediaProvider>
    </div>
  );
};

export default Video;

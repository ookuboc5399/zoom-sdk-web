import React, { useState, useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { message } from 'antd';
import { useZoom } from '../../../context/zoom-context';
import { RecordingStatus } from '@zoom/videosdk';
import { getRecordingButtons, RecordingButton } from './recording';
import './video-footer.scss';

interface VideoFooterProps {
  className?: string;
}

export const VideoFooter: React.FC<VideoFooterProps> = ({ className }) => {
  const zmClient = useZoom();
  const recordingClient = zmClient?.getRecordingClient();
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus | ''>(
    recordingClient?.getCloudRecordingStatus() || ''
  );

  const onRecordingClick = async (key: string) => {
    if (!recordingClient) {
      message.error('Recording client not available');
      return;
    }

    const startTime = performance.now();
    try {
      let result: '' | Error;
      switch (key) {
        case 'Record':
          if (!recordingClient.canStartRecording()) {
            message.error('Cannot start recording - insufficient permissions');
            return;
          }
          result = await recordingClient.startCloudRecording();
          break;
        case 'Resume':
          result = await recordingClient.resumeCloudRecording();
          break;
        case 'Stop':
          result = await recordingClient.stopCloudRecording();
          break;
        case 'Pause':
          result = await recordingClient.pauseCloudRecording();
          break;
        default:
          console.warn(`Unknown recording action: ${key}`);
          return;
      }

      if (result instanceof Error) {
        throw result;
      }

      const endTime = performance.now();
      const operationTime = endTime - startTime;
      if (operationTime > 1000) {
        console.warn(`Recording operation '${key}' took ${operationTime}ms - performance degradation detected`);
      }
    } catch (error) {
      console.error(`Recording operation '${key}' failed:`, error);
      message.error(`Recording operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const onRecordingChange = useCallback(() => {
    if (!recordingClient) return;
    setRecordingStatus(recordingClient.getCloudRecordingStatus() || '');
  }, [recordingClient]);

  useEffect(() => {
    if (!zmClient) return;
    zmClient.on('recording-change', onRecordingChange);
    return () => {
      zmClient?.off('recording-change', onRecordingChange);
    };
  }, [zmClient, onRecordingChange]);

  const recordingButtons = getRecordingButtons(
    recordingStatus,
    zmClient?.isHost() || false
  );

  return (
    <div className={classNames('video-footer', className)}>
      <div className="video-footer__controls">
        {recordingButtons.map((button) => (
          <RecordingButton
            key={button.text}
            {...button}
            onClick={() => onRecordingClick(button.text)}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoFooter;

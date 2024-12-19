import React, { useState, useCallback } from 'react';
import { RecordingStatus } from '@zoom/videosdk';
import { Button, Tooltip, message } from 'antd';
import classNames from 'classnames';
import { IconFont } from '../../../component/icon-font';
import { useMedia } from '../../../context/media-context';

export interface RecordButtonProps {
  text: string;
  tipText: string;
  icon: string;
  hoverIcon: string;
  onClick?: () => void;
}

export const recordStatusIcon = {
  text: 'Status',
  tipText: 'Recording Status',
  icon: 'icon-recording-animated',
  hoverIcon: 'icon-recording-animated-hover'
};

export const getRecordingButtons = (status: RecordingStatus | '', isHost: boolean) => {
  let buttons: RecordButtonProps[] = [];

  if (status === RecordingStatus.Stopped || status === '') {
    buttons = [
      {
        text: 'Record',
        tipText: 'Start Recording',
        icon: 'icon-recording',
        hoverIcon: 'icon-recording-hover'
      }
    ];
  } else if (status === RecordingStatus.Recording) {
    if (!isHost) return [recordStatusIcon];
    buttons = [
      recordStatusIcon,
      {
        text: 'Pause',
        tipText: 'Pause Recording',
        icon: 'icon-recording-pause',
        hoverIcon: 'icon-recording-pause-hover'
      },
      {
        text: 'Stop',
        tipText: 'Stop Recording',
        icon: 'icon-recording-stop',
        hoverIcon: 'icon-recording-stop-hover'
      }
    ];
  } else if (status === RecordingStatus.Paused) {
    if (!isHost) return [recordStatusIcon];
    buttons = [
      recordStatusIcon,
      {
        text: 'Resume',
        tipText: 'Resume Recording',
        icon: 'icon-recording-resume',
        hoverIcon: 'icon-recording-resume-hover'
      },
      {
        text: 'Stop',
        tipText: 'Stop Recording',
        icon: 'icon-recording-stop',
        hoverIcon: 'icon-recording-stop-hover'
      }
    ];
  }
  return buttons;
};

const RecordingButton: React.FC<RecordButtonProps> = ({ tipText, icon, hoverIcon, onClick }) => {
  const [isHover, setIsHover] = useState(false);
  const { performanceMetrics } = useMedia();

  const handleClick = useCallback(async () => {
    try {
      if (onClick) {
        const startTime = performance.now();
        await onClick();
        const endTime = performance.now();
        const operationTime = endTime - startTime;

        if (operationTime > 1000) {
          console.warn(`Recording operation took ${operationTime}ms - performance degradation detected`);
        }
      }
    } catch (error) {
      console.error('Recording operation failed:', error);
      message.error(`Recording operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [onClick]);

  return (
    <Tooltip title={tipText}>
      <Button
        className={classNames('vc-button', {
          'high-latency': performanceMetrics.apiRequestLatency > 1000
        })}
        icon={<IconFont type={isHover ? hoverIcon : icon} />}
        ghost={true}
        shape="circle"
        size="large"
        onClick={handleClick}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
      />
    </Tooltip>
  );
};

export { RecordingButton };

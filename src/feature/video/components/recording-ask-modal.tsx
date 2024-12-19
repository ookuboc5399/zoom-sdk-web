import React, { useState } from 'react';
import { Modal, message } from 'antd';
import classNames from 'classnames';
import { useMedia } from '../../../context/media-context';
import './recording-ask-modal.scss';

interface IsoRecordingModalProps {
  onClick: () => Promise<void>;
  onCancel: () => Promise<void>;
}

const IsoRecordingModal: React.FC<IsoRecordingModalProps> = ({ onClick, onCancel }) => {
  const [visible, setVisible] = useState(true);
  const { performanceMetrics } = useMedia();

  const handleOk = async () => {
    try {
      const startTime = performance.now();
      await onClick();
      const endTime = performance.now();
      const operationTime = endTime - startTime;

      if (operationTime > 1000) {
        console.warn(`Recording modal operation took ${operationTime}ms - performance degradation detected`);
      }

      setVisible(false);
    } catch (error) {
      console.error('Recording modal operation failed:', error);
      message.error(`Recording operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancel = async () => {
    try {
      await onCancel();
      setVisible(false);
    } catch (error) {
      console.error('Recording modal cancel failed:', error);
      message.error(`Cancel operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Modal
      open={visible}
      className={classNames('recording-iso-ask-dialog', {
        'high-latency': performanceMetrics.apiRequestLatency > 1000
      })}
      title="Recording Confirmation"
      okText="Accept"
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose
    >
      Do you want to allow Individual Cloud recording mode?
    </Modal>
  );
};

export default IsoRecordingModal;

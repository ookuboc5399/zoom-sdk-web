import React from 'react';
import { Button } from 'antd';
import { getConfig } from '../../config';
import { generateVideoToken } from '../../utils/util';
import './preview.scss';

interface PreviewProps {
  onJoin: () => void;
}

const Preview: React.FC<PreviewProps> = ({ onJoin }) => {
  const config = getConfig();
  const { sdkKey, sdkSecret, topic, password, userIdentity, sessionKey } = config;

  const handleJoin = () => {
    const token = generateVideoToken(sdkKey, sdkSecret, topic, password, userIdentity, sessionKey);
    if (token) {
      onJoin();
    }
  };

  return (
    <div className="preview-container">
      <div className="preview-content">
        <h1>Real Estate Consultation</h1>
        <Button type="primary" onClick={handleJoin}>
          Join Meeting
        </Button>
      </div>
    </div>
  );
};

export default Preview;

import React from 'react';
import { useMedia } from '../../context/media-context';
import './command.scss';

const Command: React.FC = () => {
  const { mediaStream } = useMedia();

  return (
    <div className="command-container">
      <h2>Command Center</h2>
      <p>Command functionality will be implemented here.</p>
    </div>
  );
};

export default Command;

import React from 'react';
import { useContext } from 'react';
import ZoomMediaContext from '../../context/media-context';
import './command.scss';

const Command: React.FC = () => {
  const { mediaStream } = useContext(ZoomMediaContext);

  return (
    <div className="command-container">
      <h2>Command Center</h2>
      <p>Command functionality will be implemented here.</p>
    </div>
  );
};

export default Command;

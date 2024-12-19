import React from 'react';
import { useMedia } from '../../context/media-context';
import './subsession.scss';

const Subsession: React.FC = () => {
  const { mediaStream } = useMedia();

  return (
    <div className="subsession-container">
      <h2>Subsession</h2>
      <p>Subsession functionality will be implemented here.</p>
    </div>
  );
};

export default Subsession;

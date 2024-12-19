import React from 'react';
import { useContext } from 'react';
import ZoomMediaContext from '../../context/media-context';
import './chat.scss';

const Chat: React.FC = () => {
  const { mediaStream } = useContext(ZoomMediaContext);

  return (
    <div className="chat-container">
      <h2>Chat Feature</h2>
      <p>Chat functionality will be implemented here.</p>
    </div>
  );
};

export default Chat;

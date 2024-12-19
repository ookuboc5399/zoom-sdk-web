import React from 'react';
import { useMedia } from '../../context/media-context';
import './chat.scss';

const Chat: React.FC = () => {
  const { mediaStream } = useMedia();

  return (
    <div className="chat-container">
      <h2>Chat Feature</h2>
      <p>Chat functionality will be implemented here.</p>
    </div>
  );
};

export default Chat;

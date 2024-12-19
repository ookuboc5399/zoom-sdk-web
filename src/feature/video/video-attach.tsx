import React, { useEffect, useRef } from 'react';
import useMedia from '../../context/media-context';
import './video.scss';

const VideoAttach: React.FC = () => {
  const { mediaStream } = useMedia();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mediaStream && containerRef.current) {
      mediaStream.attachVideo(containerRef.current);
    }
    return () => {
      mediaStream?.detachVideo();
    };
  }, [mediaStream]);

  return (
    <div className="video-container">
      <div ref={containerRef} id="video-player-container" />
    </div>
  );
};

export default VideoAttach;

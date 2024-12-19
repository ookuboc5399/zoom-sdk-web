import React, { useEffect, useRef } from 'react';
import useMedia from '../../context/media-context';
import './video.scss';

const VideoSingle: React.FC = () => {
  const { mediaStream } = useMedia();
  const videoRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (mediaStream && videoRef.current) {
      mediaStream.startVideo({ videoElement: videoRef.current });
    }
    return () => {
      mediaStream?.stopVideo();
    };
  }, [mediaStream]);

  return (
    <div className="video-container">
      <canvas ref={videoRef} id="video-canvas" />
    </div>
  );
};

export default VideoSingle;

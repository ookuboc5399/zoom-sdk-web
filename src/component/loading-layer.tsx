import React from 'react';
import { Spin } from 'antd';
import './loading-layer.scss';

interface LoadingLayerProps {
  content?: string;
}

const LoadingLayer: React.FC<LoadingLayerProps> = ({ content }) => {
  return (
    <div className="loading-layer">
      <Spin size="large" tip={content} />
    </div>
  );
};

export default LoadingLayer;

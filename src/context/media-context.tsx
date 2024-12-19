import React, { createContext, useContext, ReactNode } from 'react';

interface PerformanceMetrics {
  audioProcessingLatency: number;
  apiRequestLatency: number;
  memoryUsage: {
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
}

interface MediaContextType {
  audioLevel: number;
  isAudioProcessing: boolean;
  processingLatency: number;
  audioError: string | null;
  performanceMetrics: PerformanceMetrics;
  audio: {
    muted: boolean;
    toggleMute: () => void;
  };
  video: {
    muted: boolean;
    toggleMute: () => void;
  };
  mediaStream: any;
}

const defaultPerformanceMetrics: PerformanceMetrics = {
  audioProcessingLatency: 0,
  apiRequestLatency: 0,
  memoryUsage: {
    heapTotal: 0,
    heapUsed: 0,
    external: 0
  }
};

const MediaContext = createContext<MediaContextType | null>(null);

interface MediaProviderProps {
  children: ReactNode;
  value: MediaContextType;
}

const MediaProvider: React.FC<MediaProviderProps> = ({ children, value }) => {
  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
};

function useMedia(): MediaContextType {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}

export { MediaContext, MediaProvider };
export default useMedia;
export type { PerformanceMetrics, MediaContextType, MediaProviderProps };

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

const MediaContext = createContext<MediaContextType>({
  audioLevel: 0,
  isAudioProcessing: false,
  processingLatency: 0,
  audioError: null,
  performanceMetrics: defaultPerformanceMetrics
});

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

const useMedia = (): MediaContextType => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};

export type { PerformanceMetrics, MediaContextType, MediaProviderProps };
export { MediaContext, MediaProvider, useMedia };

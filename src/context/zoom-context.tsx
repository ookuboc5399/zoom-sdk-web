import React, { createContext, useContext, ReactNode } from 'react';
import { VideoClient, RecordingStatus } from '@zoom/videosdk';
import { Stream } from '@zoom/videosdk';

interface RecordingClient {
  startCloudRecording: () => Promise<'' | Error>;
  stopCloudRecording: () => Promise<'' | Error>;
  pauseCloudRecording: () => Promise<'' | Error>;
  resumeCloudRecording: () => Promise<'' | Error>;
  getCloudRecordingStatus: () => RecordingStatus | '';
  canStartRecording: () => boolean;
}

interface ZoomContextType {
  client: typeof VideoClient;
  mediaStream: typeof Stream;
  getRecordingClient: () => RecordingClient | null;
  isHost: () => boolean;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

const defaultContext: ZoomContextType = {
  client: VideoClient,
  mediaStream: Stream,
  getRecordingClient: () => null,
  isHost: () => false,
  on: () => {},
  off: () => {}
};

const ZoomContext = createContext<ZoomContextType>(defaultContext);

interface ZoomProviderProps {
  children: ReactNode;
  client: typeof VideoClient;
  mediaStream: typeof Stream;
}

export const ZoomProvider: React.FC<ZoomProviderProps> = ({ children, client, mediaStream }) => {
  const getRecordingClient = () => {
    try {
      return client?.getRecordingClient() || null;
    } catch (error) {
      console.error('Failed to get recording client:', error);
      return null;
    }
  };

  const isHost = () => {
    try {
      return client?.isHost() || false;
    } catch (error) {
      console.error('Failed to check host status:', error);
      return false;
    }
  };

  const value = {
    client,
    mediaStream,
    getRecordingClient,
    isHost,
    on: (event: string, callback: (...args: any[]) => void) => client?.on(event, callback),
    off: (event: string, callback: (...args: any[]) => void) => client?.off(event, callback)
  };

  return (
    <ZoomContext.Provider value={value}>
      {children}
    </ZoomContext.Provider>
  );
};

const useZoom = (): ZoomContextType => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};

export { ZoomContext, useZoom };

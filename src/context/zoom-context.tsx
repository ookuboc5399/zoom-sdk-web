import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import ZoomVideo from '@zoom/videosdk';
import type { ExecutedResult } from '@zoom/videosdk/dist/types/common';
import { RecordingClient } from '@zoom/videosdk/dist/types/recording';

interface ZoomContextType {
  init: (lang: string, webEndpoint: string, options: any) => ExecutedResult;
  join: (topic: string, signature: string, name: string, password?: string) => ExecutedResult;
  leave: () => ExecutedResult;
  getMediaStream: () => any; // Using any temporarily for Stream type
  getSessionInfo: () => any;
  getRecordingClient: () => typeof RecordingClient | null;
  isHost: () => boolean;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
}

const defaultContext: ZoomContextType = {
  init: () => Promise.resolve({ code: 0, result: '' }) as unknown as ExecutedResult,
  join: () => Promise.resolve({ code: 0, result: '' }) as unknown as ExecutedResult,
  leave: () => Promise.resolve({ code: 0, result: '' }) as unknown as ExecutedResult,
  getMediaStream: () => {
    throw new Error('ZoomContext not initialized');
  },
  getSessionInfo: () => {
    throw new Error('ZoomContext not initialized');
  },
  getRecordingClient: () => null,
  isHost: () => false,
  on: () => {},
  off: () => {}
};

export const ZoomContext = createContext<ZoomContextType>(defaultContext);

interface ZoomProviderProps {
  children: ReactNode;
}

export const ZoomProvider: React.FC<ZoomProviderProps> = ({ children }) => {
  const [client, setClient] = useState(ZoomVideo.createClient());

  useEffect(() => {
    if (!client) {
      setClient(ZoomVideo.createClient());
    }
  }, []);

  const value: ZoomContextType = {
    init: (lang: string, webEndpoint: string, options: any) => {
      if (!client) throw new Error('Zoom client not initialized');
      return client.init(lang, webEndpoint, options);
    },
    join: (topic: string, signature: string, name: string, password?: string) => {
      if (!client) throw new Error('Zoom client not initialized');
      return client.join(topic, signature, name, password);
    },
    leave: () => {
      if (!client) throw new Error('Zoom client not initialized');
      return client.leave();
    },
    getMediaStream: () => {
      if (!client) throw new Error('Zoom client not initialized');
      return client.getMediaStream();
    },
    getSessionInfo: () => {
      if (!client) throw new Error('Zoom client not initialized');
      return client.getSessionInfo();
    },
    getRecordingClient: () => {
      if (!client) throw new Error('Zoom client not initialized');
      return client.getRecordingClient() || null;
    },
    isHost: () => {
      if (!client) return false;
      return client.isHost() || false;
    },
    on: (event: string, callback: (...args: any[]) => void) => {
      if (!client) throw new Error('Zoom client not initialized');
      client.on(event, callback);
    },
    off: (event: string, callback: (...args: any[]) => void) => {
      if (!client) throw new Error('Zoom client not initialized');
      client.off(event, callback);
    }
  };

  return (
    <ZoomContext.Provider value={value}>
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = (): ZoomContextType => {
  const context = useContext(ZoomContext);
  if (!context) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};

export type { ZoomContextType, ZoomProviderProps };

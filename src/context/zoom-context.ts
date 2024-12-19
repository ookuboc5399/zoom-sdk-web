import { createContext } from 'react';
import { ZoomClient, MediaStream } from '@zoom/videosdk';

interface ZoomContextType {
  client: ZoomClient | null;
  mediaStream: MediaStream | null;
}

const ZoomContext = createContext<ZoomContextType>({
  client: null,
  mediaStream: null
});

export default ZoomContext;

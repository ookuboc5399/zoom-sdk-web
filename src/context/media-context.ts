import { createContext } from 'react';
import { MediaStream } from '@zoom/videosdk';

interface MediaContextType {
  mediaStream: MediaStream | null;
  audioLevel: number;
}

const ZoomMediaContext = createContext<MediaContextType>({
  mediaStream: null,
  audioLevel: 0
});

export default ZoomMediaContext;

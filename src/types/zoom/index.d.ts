import { VideoClient, Stream } from '@zoom/videosdk';

declare module '@zoom/videosdk' {
  export interface ZoomClient extends VideoClient {
    getMediaStream(): Stream;
  }

  export interface MediaStream extends Stream {
    startAudio(): Promise<void>;
    stopAudio(): void;
    on(event: 'audio-volume-change', callback: (payload: { volume: number }) => void): void;
  }
}

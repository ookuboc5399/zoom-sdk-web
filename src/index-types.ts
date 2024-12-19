import { MediaStream as ZoomMediaStream } from '@zoom/videosdk';

export interface MediaStream extends ZoomMediaStream {
  isSupportMultipleVideos: () => boolean;
}

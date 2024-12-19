import { useEffect, useState, useCallback, useReducer, useMemo } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import ZoomVideo, { ConnectionState, ReconnectReason } from '@zoom/videosdk';
import { message, Modal } from 'antd';
import 'antd/dist/antd.min.css';
import produce from 'immer';
import Home from './feature/home/home';
import Video from './feature/video/video';
import VideoSingle from './feature/video/video-single';
import VideoAttach from './feature/video/video-attach';
import Preview from './feature/preview/preview';
import { useZoom, ZoomProvider } from './context/zoom-context';
import MediaContext from './context/media-context';
import LoadingLayer from './component/loading-layer';
import Chat from './feature/chat/chat';
import Command from './feature/command/command';
import Subsession from './feature/subsession/subsession';
import { MediaStream } from './index-types';
import './App.css';
import { AzureOpenAIService } from './services/azure-openai';
import { FeedbackPanel } from './feature/video/components/feedback-panel';

interface AppProps {
  meetingArgs: {
    sdkKey: string;
    topic: string;
    signature: string;
    name: string;
    password?: string;
    webEndpoint?: string;
    enforceGalleryView?: string;
    enforceVB?: string;
    customerJoinId?: string;
    lang?: string;
    useVideoPlayer?: string;
  };
}
const mediaShape = {
  audio: {
    encode: false,
    decode: false
  },
  video: {
    encode: false,
    decode: false
  },
  share: {
    encode: false,
    decode: false
  },
  audioLevel: 0
};
const mediaReducer = produce((draft, action) => {
  switch (action.type) {
    case 'audio-encode': {
      draft.audio.encode = action.payload;
      break;
    }
    case 'audio-decode': {
      draft.audio.decode = action.payload;
      break;
    }
    case 'video-encode': {
      draft.video.encode = action.payload;
      break;
    }
    case 'video-decode': {
      draft.video.decode = action.payload;
      break;
    }
    case 'share-encode': {
      draft.share.encode = action.payload;
      break;
    }
    case 'share-decode': {
      draft.share.decode = action.payload;
      break;
    }
    case 'reset-media': {
      Object.assign(draft, { ...mediaShape });
      break;
    }
    default:
      break;
  }
}, mediaShape);

declare global {
  interface Window {
    webEndpoint: string | undefined;
    zmClient: any | undefined;
    mediaStream: any | undefined;
    crossOriginIsolated: boolean;
    ltClient: any | undefined;
    logClient: any | undefined;
  }
}

// Initialize Azure service
const azureService = new AzureOpenAIService();

function App(props: AppProps) {
  const {
    meetingArgs: {
      sdkKey,
      topic,
      signature,
      name,
      password,
      webEndpoint: webEndpointArg,
      enforceGalleryView,
      enforceVB,
      customerJoinId,
      lang,
      useVideoPlayer
    }
  } = props;
  const [loading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');
  const [isFailover, setIsFailover] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('closed');
  const [mediaState, dispatch] = useReducer(mediaReducer, mediaShape);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isSupportGalleryView, setIsSupportGalleryView] = useState<boolean>(false);
  const zoom = useZoom();

  let webEndpoint: any;
  if (webEndpointArg) {
    webEndpoint = webEndpointArg;
  } else {
    webEndpoint = window?.webEndpoint ?? 'zoom.us';
  }

  const mediaContext = useMemo(() => ({ ...mediaState, mediaStream, audioLevel: 0 }), [mediaState, mediaStream]);
  const galleryViewWithoutSAB = Number(enforceGalleryView) === 1 && !window.crossOriginIsolated;
  const vbWithoutSAB = Number(enforceVB) === 1 && !window.crossOriginIsolated;
  const galleryViewWithAttach = Number(useVideoPlayer) === 1 && (window.crossOriginIsolated || galleryViewWithoutSAB);

  const onConnectionChange = useCallback(
    (payload: any) => {
      if (payload.state === ConnectionState.Reconnecting) {
        setIsLoading(true);
        setIsFailover(true);
        setStatus('connecting');
        const { reason, subsessionName } = payload;
        if (reason === ReconnectReason.Failover) {
          setLoadingText('Session Disconnected, Try to reconnect');
        } else if (reason === ReconnectReason.JoinSubsession || reason === ReconnectReason.MoveToSubsession) {
          setLoadingText(`Joining ${subsessionName}...`);
        } else if (reason === ReconnectReason.BackToMainSession) {
          setLoadingText('Returning to Main Session...');
        }
      } else if (payload.state === ConnectionState.Connected) {
        setStatus('connected');
        if (isFailover) {
          setIsLoading(false);
        }
      } else if (payload.state === ConnectionState.Closed) {
        setStatus('closed');
        dispatch({ type: 'reset-media' });
        if (payload.reason === 'ended by host') {
          Modal.warning({
            title: 'Meeting ended',
            content: 'This meeting has been ended by host'
          });
        }
      }
    },
    [isFailover]
  );

  const onMediaSDKChange = useCallback((payload: any) => {
    const { action, type, result } = payload;
    dispatch({ type: `${type}-${action}`, payload: result === 'success' });
  }, []);

  const onLeaveOrJoinSession = useCallback(async () => {
    if (status === 'closed') {
      setIsLoading(true);
      await zoom.join(topic, signature, name, password);
      setIsLoading(false);
    } else if (status === 'connected') {
      await zoom.leave();
      message.warn('You have left the session.');
    }
  }, [zoom, status, topic, signature, name, password]);

  useEffect(() => {
    const init = async () => {
      try {
        await zoom.init('en-US', `${window.location.origin}/lib`, {
          webEndpoint,
          enforceMultipleVideos: galleryViewWithoutSAB,
          enforceVirtualBackground: vbWithoutSAB,
          stayAwake: true,
          patchJsMedia: true,
          leaveOnPageUnload: false
        });
        setLoadingText('Joining the session...');
        await zoom.join(topic, signature, name, password);
        const stream = zoom.getMediaStream();
        setMediaStream(stream);
        setIsSupportGalleryView(stream.isSupportMultipleVideos());
        setIsLoading(false);
      } catch (e: any) {
        setIsLoading(false);
        message.error(e.reason);
      }
    };
    init();
    return () => {
      ZoomVideo.destroyClient();
    };
  }, [zoom, topic, signature, name, password, webEndpoint, galleryViewWithoutSAB, vbWithoutSAB]);

  useEffect(() => {
    zoom.on('connection-change', onConnectionChange);
    zoom.on('media-sdk-change', onMediaSDKChange);
    return () => {
      zoom.off('connection-change', onConnectionChange);
      zoom.off('media-sdk-change', onMediaSDKChange);
    };
  }, [zoom, onConnectionChange, onMediaSDKChange]);

  return (
    <div className="App">
      {loading && <LoadingLayer content={loadingText} />}
      {!loading && (
        <MediaContext.Provider value={mediaContext}>
          <Router>
            <Switch>
              <Route
                path="/"
                render={(props) => <Home {...props} status={status} onLeaveOrJoinSession={onLeaveOrJoinSession} />}
                exact
              />
              <Route path="/index.html" component={Home} exact />
              <Route path="/chat" component={Chat} />
              <Route path="/command" component={Command} />
              <Route
                path="/video"
                render={() => (
                  <>
                    {isSupportGalleryView ? (galleryViewWithAttach ? <VideoAttach /> : <Video />) : <VideoSingle />}
                    <FeedbackPanel azureService={azureService} />
                  </>
                )}
              />
              <Route path="/subsession" component={Subsession} />
              <Route path="/preview" component={Preview} />
            </Switch>
          </Router>
        </MediaContext.Provider>
      )}
    </div>
  );
}

const AppWithProvider = (props: AppProps) => (
  <ZoomProvider>
    <App {...props} />
  </ZoomProvider>
);

export default AppWithProvider;

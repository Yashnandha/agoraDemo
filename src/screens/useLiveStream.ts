import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import type { DataStreamConfig } from 'react-native-agora';
import {
  AudienceLatencyLevelType,
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  IRtcEngineEventHandler,
} from 'react-native-agora';

import { APP_ID, DEFAULT_CHANNEL, TOKEN } from '../utils/constant';

type CallType = 'audio' | 'video';
type CallRole = 'host' | 'viewer';
type CallSignalType =
  | 'call-request'
  | 'call-accepted'
  | 'call-rejected'
  | 'call-ended';

type CallSignal = {
  type: CallSignalType;
  callId: string;
  callType: CallType;
  fromRole: CallRole;
};

type CallSession = {
  callId: string;
  callType: CallType;
  fromRole: CallRole;
  status: 'ringing' | 'calling' | 'connected' | 'rejected' | 'ended';
};

const DATA_STREAM_CONFIG: DataStreamConfig = {
  ordered: true,
  syncWithAudio: false,
};

const createCallId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const encodeSignal = (signal: CallSignal) => {
  const payload = JSON.stringify(signal);
  return new Uint8Array(Array.from(payload).map(char => char.charCodeAt(0)));
};

const decodeSignal = (data: Uint8Array) => {
  const payload = Array.from(data)
    .map(char => String.fromCharCode(char))
    .join('');

  return JSON.parse(payload) as CallSignal;
};

export const useLiveStream = () => {
  const engineRef = useRef<IRtcEngine | null>(null);
  const eventHandler = useRef<IRtcEngineEventHandler>({});
  const dataStreamIdRef = useRef<number | null>(null);
  const hostMediaBeforeCallRef = useRef<{
    isMicOn: boolean;
    isCameraOn: boolean;
  } | null>(null);
  const viewerCallModeRef = useRef(false);
  const bystandardMutedRef = useRef<{ audio: boolean; video: boolean }>({
    audio: false,
    video: false,
  });

  const [isJoined, setIsJoined] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [channelId, setChannelId] = useState(DEFAULT_CHANNEL);
  const [activeChannelId, setActiveChannelId] = useState(DEFAULT_CHANNEL);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [users, setUsers] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(0);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<CallSession | null>(null);
  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
  const [callNotice, setCallNotice] = useState<string | null>(null);
  const isHostRef = useRef(isHost);
  const outgoingCallRef = useRef<CallSession | null>(null);
  const activeCallRef = useRef<CallSession | null>(null);

  const resolvedChannelId = channelId.trim() || DEFAULT_CHANNEL;

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    outgoingCallRef.current = outgoingCall;
  }, [outgoingCall]);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  const ensureDataStream = () => {
    if (dataStreamIdRef.current !== null) {
      return dataStreamIdRef.current;
    }

    const streamId =
      engineRef.current?.createDataStream(DATA_STREAM_CONFIG) ?? -1;

    if (streamId < 0) {
      setErrorMessage(
        `Unable to create call channel. Agora returned ${streamId}.`,
      );
      return null;
    }

    dataStreamIdRef.current = streamId;
    return streamId;
  };

  const sendSignal = (signal: CallSignal) => {
    const streamId = ensureDataStream();

    if (streamId === null || !engineRef.current) {
      return false;
    }

    const payload = encodeSignal(signal);
    const result = engineRef.current.sendStreamMessage(
      streamId,
      payload,
      payload.length,
    );

    if (result < 0) {
      setErrorMessage(`Unable to send call signal. Agora returned ${result}.`);
      return false;
    }

    return true;
  };

  const applyHostCallMedia = (callType: CallType) => {
    if (!engineRef.current) {
      return;
    }

    if (!hostMediaBeforeCallRef.current) {
      hostMediaBeforeCallRef.current = {
        isMicOn,
        isCameraOn,
      };
    }

    setIsMicOn(true);

    if (callType === 'audio') {
      setIsCameraOn(false);
      engineRef.current.muteLocalAudioStream(false);
      engineRef.current.muteLocalVideoStream(true);
      return;
    }

    setIsCameraOn(true);
    engineRef.current.muteLocalAudioStream(false);
    engineRef.current.muteLocalVideoStream(false);
  };

  const enterViewerCallMode = (callType: CallType) => {
    if (!engineRef.current || viewerCallModeRef.current) {
      return;
    }

    viewerCallModeRef.current = true;

    if (callType === 'video') {
      // Enable video engine + capture so PiP self-view renders.
      engineRef.current.enableVideo();
      engineRef.current.startPreview();
    }

    // Publish viewer's tracks so host can hear/see them.
    engineRef.current.updateChannelMediaOptions({
      publishMicrophoneTrack: true,
      publishCameraTrack: callType === 'video',
    });

    // Sync UI toggle state.
    setIsMicOn(true);
    setIsCameraOn(callType === 'video');

    // For audio calls suppress remote video (not needed).
    if (callType === 'audio') {
      engineRef.current.muteAllRemoteVideoStreams(true);
    }
  };

  const exitViewerCallMode = () => {
    if (!engineRef.current || !viewerCallModeRef.current) {
      return;
    }

    viewerCallModeRef.current = false;

    // Stop publishing — back to silent audience mode.
    engineRef.current.updateChannelMediaOptions({
      publishMicrophoneTrack: false,
      publishCameraTrack: false,
    });
    engineRef.current.stopPreview();

    setIsMicOn(false);
    setIsCameraOn(false);

    engineRef.current.muteAllRemoteVideoStreams(false);
  };

  const restoreBystander = () => {
    if (bystandardMutedRef.current.audio) {
      engineRef.current?.muteAllRemoteAudioStreams(false);
      bystandardMutedRef.current.audio = false;
    }
    if (bystandardMutedRef.current.video) {
      engineRef.current?.muteAllRemoteVideoStreams(false);
      bystandardMutedRef.current.video = false;
    }
  };

  const restoreHostMedia = () => {
    if (!engineRef.current || !hostMediaBeforeCallRef.current) {
      return;
    }

    const previous = hostMediaBeforeCallRef.current;
    engineRef.current.muteLocalAudioStream(!previous.isMicOn);
    engineRef.current.muteLocalVideoStream(!previous.isCameraOn);
    setIsMicOn(previous.isMicOn);
    setIsCameraOn(previous.isCameraOn);
    hostMediaBeforeCallRef.current = null;
  };

  // 🎥 Preview
  const startPreview = () => {
    engineRef.current?.enableVideo();
    engineRef.current?.startPreview();
  };

  const stopPreview = () => {
    engineRef.current?.stopPreview();
  };

  // 🚀 Join
  const join = (nextIsHost: boolean) => {
    if (isJoined) return;

    const nextChannelId = channelId.trim() || DEFAULT_CHANNEL;
    setIsHost(nextIsHost);
    setIsMicOn(nextIsHost);
    setIsCameraOn(nextIsHost);
    setChannelId(nextChannelId);
    setActiveChannelId(nextChannelId);
    setErrorMessage(null);
    setRemoteUid(null);
    setUsers([]);
    setSeconds(0);
    setIncomingCall(null);
    setOutgoingCall(null);
    setActiveCall(null);
    setCallNotice(null);
    dataStreamIdRef.current = null;
    hostMediaBeforeCallRef.current = null;

    if (nextIsHost) {
      setIsMicOn(true);
      setIsCameraOn(true);
      startPreview();
    } else {
      stopPreview();
    }

    const joinResult = engineRef.current?.joinChannel(TOKEN, nextChannelId, 0, {
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      publishCameraTrack: nextIsHost,
      publishMicrophoneTrack: nextIsHost,
      autoSubscribeAudio: true,
      autoSubscribeVideo: true,
      audienceLatencyLevel:
        AudienceLatencyLevelType.AudienceLatencyLevelUltraLowLatency,
    });

    if (typeof joinResult === 'number' && joinResult < 0) {
      stopPreview();
      setErrorMessage(`Unable to join stream. Agora returned ${joinResult}.`);
    }
  };

  // ❌ Leave
  const leave = () => {
    engineRef.current?.leaveChannel();
    stopPreview();
    restoreHostMedia();
    exitViewerCallMode();
    restoreBystander();
    dataStreamIdRef.current = null;
    setRemoteUid(null);
    setUsers([]);
    setSeconds(0);
    setIncomingCall(null);
    setOutgoingCall(null);
    setActiveCall(null);
    setCallNotice(null);
  };

  // 🎙 Mic
  const toggleMic = () => {
    const state = !isMicOn;
    setIsMicOn(state);
    engineRef.current?.muteLocalAudioStream(!state);
  };

  // 📷 Camera
  const toggleCamera = () => {
    const state = !isCameraOn;
    setIsCameraOn(state);
    engineRef.current?.muteLocalVideoStream(!state);
  };

  // 🔄 Flip Camera
  const switchCamera = () => {
    engineRef.current?.switchCamera();
  };

  const startCall = (callType: CallType) => {
    if (!isJoined || isHost) {
      return;
    }

    const callId = createCallId();
    const session: CallSession = {
      callId,
      callType,
      fromRole: 'viewer',
      status: 'calling',
    };

    setOutgoingCall(session);
    setCallNotice(
      `${callType === 'audio' ? 'Audio' : 'Video'} call request sent to host`,
    );
    sendSignal({
      type: 'call-request',
      callId,
      callType,
      fromRole: 'viewer',
    });
  };

  const acceptIncomingCall = () => {
    if (!incomingCall) {
      return;
    }

    const acceptedCall = {
      ...incomingCall,
      status: 'connected' as const,
    };

    setActiveCall(acceptedCall);
    setIncomingCall(null);
    setCallNotice(
      `${acceptedCall.callType === 'audio' ? 'Audio' : 'Video'} call connected`,
    );
    applyHostCallMedia(acceptedCall.callType);
    sendSignal({
      type: 'call-accepted',
      callId: acceptedCall.callId,
      callType: acceptedCall.callType,
      fromRole: 'host',
    });
  };

  const rejectIncomingCall = () => {
    if (!incomingCall) {
      return;
    }

    const rejectedCall = {
      ...incomingCall,
      status: 'rejected' as const,
    };

    setCallNotice(
      `${rejectedCall.callType === 'audio' ? 'Audio' : 'Video'} call declined`,
    );
    setIncomingCall(null);
    sendSignal({
      type: 'call-rejected',
      callId: rejectedCall.callId,
      callType: rejectedCall.callType,
      fromRole: 'host',
    });
  };

  const endCall = () => {
    if (!activeCall && !outgoingCall && !incomingCall) {
      return;
    }

    const callToEnd = activeCall ?? outgoingCall ?? incomingCall;

    if (callToEnd) {
      sendSignal({
        type: 'call-ended',
        callId: callToEnd.callId,
        callType: callToEnd.callType,
        fromRole: isHost ? 'host' : 'viewer',
      });
    }

    restoreHostMedia();
    exitViewerCallMode();
    setActiveCall(null);
    setOutgoingCall(null);
    setIncomingCall(null);
    setCallNotice('Call ended');
  };

  // ⏱ Timer
  useEffect(() => {
    let interval: any;

    if (isJoined) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isJoined]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const initialize = async () => {
      if (engineRef.current) {
        return;
      }

      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
      }

      const engine = createAgoraRtcEngine();
      engineRef.current = engine;

      await engine.initialize({ appId: APP_ID });

      const handleIncomingSignal = (signal: CallSignal) => {
        if (signal.type === 'call-request') {
          if (isHostRef.current) {
            setIncomingCall({
              callId: signal.callId,
              callType: signal.callType,
              fromRole: signal.fromRole,
              status: 'ringing',
            });
            setCallNotice(
              `Incoming ${
                signal.callType === 'audio' ? 'audio' : 'video'
              } call`,
            );
          }

          return;
        }

        // Host ignores accepted/rejected/ended — host is the sender of those
        if (isHostRef.current) {
          return;
        }

        const isCallerForThisCall =
          outgoingCallRef.current?.callId === signal.callId ||
          activeCallRef.current?.callId === signal.callId;

        // Bystander viewers (3, 4, 5): not involved in this call
        if (!isCallerForThisCall) {
          if (signal.type === 'call-accepted') {
            // Mute host audio so bystanders cannot hear the private call
            engineRef.current?.muteAllRemoteAudioStreams(true);
            bystandardMutedRef.current.audio = true;

            if (signal.callType === 'video') {
              // Also mute host video for a private video call
              engineRef.current?.muteAllRemoteVideoStreams(true);
              bystandardMutedRef.current.video = true;
            }
          } else if (signal.type === 'call-ended') {
            restoreBystander();
          }

          return;
        }

        // Below: the actual caller (viewer 2)
        if (signal.type === 'call-accepted') {
          const connectedCall = {
            callId: signal.callId,
            callType: signal.callType,
            fromRole: signal.fromRole,
            status: 'connected' as const,
          };

          setOutgoingCall(null);
          setActiveCall(connectedCall);
          setCallNotice(
            `${signal.callType === 'audio' ? 'Audio' : 'Video'} call connected`,
          );
          enterViewerCallMode(signal.callType);
          return;
        }

        if (signal.type === 'call-rejected') {
          setOutgoingCall(prev =>
            prev?.callId === signal.callId
              ? { ...prev, status: 'rejected' }
              : prev,
          );
          setCallNotice('Host declined the call');
          return;
        }

        if (signal.type === 'call-ended') {
          setOutgoingCall(null);
          setActiveCall(null);
          setCallNotice('Call ended');
          exitViewerCallMode();
        }
      };

      eventHandler.current = {
        onJoinChannelSuccess: () => {
          setIsJoined(true);
          setUsers([0]);
          setErrorMessage(null);
          ensureDataStream();
        },

        onUserJoined: (_, uid) => {
          setUsers(prev => [...prev, uid]);
          setRemoteUid(uid);
        },

        onUserOffline: (_, uid) => {
          setUsers(prev => prev.filter(u => u !== uid));
          setRemoteUid(currentUid => (currentUid === uid ? null : currentUid));
        },

        onLeaveChannel: () => {
          setIsJoined(false);
          setRemoteUid(null);
          setUsers([]);
          setSeconds(0);
          setIncomingCall(null);
          setOutgoingCall(null);
          setActiveCall(null);
          setCallNotice(null);
          dataStreamIdRef.current = null;
          restoreHostMedia();
          exitViewerCallMode();
          restoreBystander();
        },

        onStreamMessage: (_, senderUid, _streamId, data) => {
          if (senderUid === 0 || !data?.length) {
            return;
          }

          try {
            const signal = decodeSignal(data);
            handleIncomingSignal(signal);
          } catch {
            setErrorMessage('Received an invalid call signal.');
          }
        },

        onError: (err, msg) => {
          const details = msg?.trim()
            ? `Agora error ${err}: ${msg}`
            : `Agora error ${err}.`;
          setErrorMessage(details);
        },
      };

      engine.registerEventHandler(eventHandler.current);
    };

    initialize().catch(error => {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to initialize live stream.';
      setErrorMessage(message);
    });

    return () => {
      if (!engineRef.current) {
        return;
      }

      engineRef.current.unregisterEventHandler(eventHandler.current);
      engineRef.current.leaveChannel();
      engineRef.current.stopPreview();
      engineRef.current.release();
      engineRef.current = null;
    };
  }, []);

  return {
    isJoined,
    isHost,
    setIsHost,
    remoteUid,
    channelId,
    setChannelId,
    activeChannelId,
    resolvedChannelId,
    errorMessage,

    joinAsHost: () => join(true),
    joinAsGuest: () => join(false),
    leave,

    users,
    userCount: users.length,
    time: formatTime(seconds),

    isMicOn,
    isCameraOn,
    toggleMic,
    toggleCamera,
    switchCamera,

    incomingCall,
    outgoingCall,
    activeCall,
    callNotice,
    startCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
  };
};

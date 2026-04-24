import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  AudienceLatencyLevelType,
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  IRtcEngineEventHandler,
} from 'react-native-agora';

import { APP_ID, DEFAULT_CHANNEL, TOKEN } from '../utils/constant';

export const useLiveStream = () => {
  const engineRef = useRef<IRtcEngine | null>(null);
  const eventHandler = useRef<IRtcEngineEventHandler>({});

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

  const resolvedChannelId = channelId.trim() || DEFAULT_CHANNEL;

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
    setChannelId(nextChannelId);
    setActiveChannelId(nextChannelId);
    setErrorMessage(null);
    setRemoteUid(null);
    setUsers([]);
    setSeconds(0);

    if (nextIsHost) {
      setIsMicOn(true);
      setIsCameraOn(true);
      startPreview();
    } else {
      stopPreview();
    }

    const joinResult = engineRef.current?.joinChannel(TOKEN, nextChannelId, 0, {
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      clientRoleType: nextIsHost
        ? ClientRoleType.ClientRoleBroadcaster
        : ClientRoleType.ClientRoleAudience,
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
    setRemoteUid(null);
    setUsers([]);
    setSeconds(0);
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

      eventHandler.current = {
        onJoinChannelSuccess: () => {
          setIsJoined(true);
          setUsers([0]);
          setErrorMessage(null);
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
  };
};

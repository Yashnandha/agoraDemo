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

import { APP_ID, CHANNEL, TOKEN } from '../utils/constant';

export const useLiveStream = () => {
  const engineRef = useRef<IRtcEngine | null>(null);
  const eventHandler = useRef<IRtcEngineEventHandler>({});

  const [isJoined, setIsJoined] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);

  const [users, setUsers] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(0);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);

  // 🔐 Permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  };

  // ⚙️ Init
  const init = async () => {
    await requestPermissions();

    const engine = createAgoraRtcEngine();
    engineRef.current = engine;

    await engine.initialize({ appId: APP_ID });

    setupEvents();
  };

  // 🎧 Events
  const setupEvents = () => {
    eventHandler.current = {
      onJoinChannelSuccess: () => {
        setIsJoined(true);
        setUsers([0]);
      },

      onUserJoined: (_, uid) => {
        setUsers(prev => [...prev, uid]);
        setRemoteUid(uid);
      },

      onUserOffline: (_, uid) => {
        setUsers(prev => prev.filter(u => u !== uid));
        setRemoteUid(null);
      },
    };

    engineRef.current?.registerEventHandler(eventHandler.current);
  };

  // 🎥 Preview
  const startPreview = () => {
    engineRef.current?.enableVideo();
    engineRef.current?.startPreview();
  };

  // 🚀 Join
  const join = () => {
    if (isJoined) return;

    if (isHost) startPreview();

    engineRef.current?.joinChannel(TOKEN, CHANNEL, 0, {
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      clientRoleType: isHost
        ? ClientRoleType.ClientRoleBroadcaster
        : ClientRoleType.ClientRoleAudience,
      publishCameraTrack: isHost,
      publishMicrophoneTrack: isHost,
      autoSubscribeAudio: true,
      autoSubscribeVideo: true,
      audienceLatencyLevel:
        AudienceLatencyLevelType.AudienceLatencyLevelUltraLowLatency,
    });
  };

  // ❌ Leave
  const leave = () => {
    engineRef.current?.leaveChannel();
    setIsJoined(false);
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
    init();
  }, []);

  return {
    isJoined,
    isHost,
    setIsHost,
    remoteUid,

    join,
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

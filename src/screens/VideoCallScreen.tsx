import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RtcSurfaceView } from 'react-native-agora';
import { useLiveStream } from './useLiveStream';

type Props = {
  onBack?: () => void;
};

const VideoCallScreen = ({ onBack }: Props) => {
  const {
    isJoined,
    isHost,
    remoteUid,
    channelId,
    setChannelId,
    activeChannelId,
    resolvedChannelId,
    errorMessage,
    joinAsHost,
    joinAsGuest,
    leave,
    time,
    incomingCall,
    outgoingCall,
    activeCall,
    callNotice,
    startCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
    isMicOn,
    toggleMic,
    isCameraOn,
    switchCamera,
  } = useLiveStream();

  const handleBack = () => {
    leave();
    onBack?.();
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <View style={styles.topBlock}>
          <Text style={styles.label}>Video Call</Text>
          <Text style={styles.title}>Camera-first calling screen</Text>
          <Text style={styles.text}>
            This page keeps the video call flow separate from the live stream
            and audio-only pages.
          </Text>
        </View>

        <View style={styles.videoStage}>
          {isJoined && isHost ? (
            <RtcSurfaceView canvas={{ uid: 0 }} style={styles.video} />
          ) : isJoined && remoteUid ? (
            <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.video} />
          ) : (
            <View style={styles.heroPanel}>
              <Text style={styles.heroTitle}>Join a video room</Text>
              <Text style={styles.heroText}>
                Start as host or viewer, then use the camera and call controls
                below.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.live}>{isJoined ? 'CONNECTED' : 'READY'}</Text>
          <Text style={styles.timer}>{isJoined ? time : resolvedChannelId}</Text>
          <Text style={styles.meta}>
            {isJoined ? activeChannelId : 'Video focus'}
          </Text>
        </View>

        {callNotice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{callNotice}</Text>
          </View>
        ) : null}

        <View style={styles.bottom}>
          {!isJoined ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Join Video Room</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setChannelId}
                placeholder="Enter room ID"
                placeholderTextColor="#7C8596"
                style={styles.input}
                value={channelId}
              />

              <Text style={styles.helper}>
                Use this page when the main goal is camera-based communication.
              </Text>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.button, styles.hostButton]}
                  onPress={joinAsHost}
                >
                  <Text style={styles.buttonText}>Host Video</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.viewerButton]}
                  onPress={joinAsGuest}
                >
                  <Text style={styles.buttonText}>Viewer Video</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>
                {isHost ? 'Host Video Session' : 'Viewer Video Session'}
              </Text>

              {outgoingCall ? (
                <Text style={styles.helper}>
                  Sending {outgoingCall.callType} request to host...
                </Text>
              ) : activeCall ? (
                <Text style={styles.helper}>
                  {activeCall.callType === 'video'
                    ? 'Video call connected.'
                    : 'Audio call connected.'}
                </Text>
              ) : (
                <Text style={styles.helper}>
                  {isHost
                    ? 'Waiting for a viewer request.'
                    : 'Send a video call request to the host.'}
                </Text>
              )}

              {incomingCall ? (
                <View style={styles.callBanner}>
                  <Text style={styles.callBannerText}>
                    Incoming {incomingCall.callType} call request
                  </Text>
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.button, styles.rejectButton]}
                      onPress={rejectIncomingCall}
                    >
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.button, styles.acceptButton]}
                      onPress={acceptIncomingCall}
                    >
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <View style={styles.controlRow}>
                <TouchableOpacity style={styles.controlButton} onPress={toggleMic}>
                  <Text style={styles.controlIcon}>{isMicOn ? '🎙' : '🔇'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={switchCamera}
                >
                  <Text style={styles.controlIcon}>
                    {isCameraOn ? '📷' : '🚫📷'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!isHost && !outgoingCall && !activeCall ? (
                <TouchableOpacity
                  style={[styles.button, styles.videoCallButton]}
                  onPress={() => startCall('video')}
                >
                  <Text style={styles.buttonText}>Call Host</Text>
                </TouchableOpacity>
              ) : null}

              {(incomingCall || outgoingCall || activeCall) && (
                <TouchableOpacity style={styles.endButton} onPress={endCall}>
                  <Text style={styles.buttonText}>End Call</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.leaveButton} onPress={leave}>
                <Text style={styles.buttonText}>Leave Video Room</Text>
              </TouchableOpacity>
            </View>
          )}

          {onBack ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backText}>Back to launcher</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  topBlock: {
    gap: 10,
    marginBottom: 14,
  },
  label: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  text: {
    color: '#CBD5E1',
    lineHeight: 20,
    maxWidth: 420,
  },
  videoStage: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0B1120',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  video: {
    flex: 1,
  },
  heroPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },
  heroTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroText: {
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  live: {
    color: '#fff',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '800',
  },
  timer: {
    color: '#fff',
    backgroundColor: '#0F172ACC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  meta: {
    color: '#E2E8F0',
    backgroundColor: '#0F172ACC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '600',
  },
  notice: {
    backgroundColor: '#0F172AE6',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  noticeText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  bottom: {
    paddingBottom: 20,
    gap: 12,
  },
  panel: {
    backgroundColor: '#020617E6',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  panelTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  helper: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  callBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  callBannerText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F172ACC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlIcon: {
    color: '#fff',
    fontSize: 18,
  },
  button: {
    minHeight: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    flex: 1,
  },
  hostButton: {
    backgroundColor: '#F97316',
  },
  viewerButton: {
    backgroundColor: '#0EA5E9',
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  videoCallButton: {
    backgroundColor: '#8B5CF6',
    flex: 0,
  },
  endButton: {
    backgroundColor: '#F97316',
    minHeight: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveButton: {
    backgroundColor: '#FF3B30',
    minHeight: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  backButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backText: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
});

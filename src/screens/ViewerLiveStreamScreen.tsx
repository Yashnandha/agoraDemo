import React from 'react';
import {
  ActivityIndicator,
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

const ViewerLiveStreamScreen = ({ onBack }: Props) => {
  const {
    isJoined,
    remoteUid,
    channelId,
    setChannelId,
    activeChannelId,
    resolvedChannelId,
    errorMessage,
    joinAsGuest,
    leave,
    userCount,
    time,
    incomingCall,
    outgoingCall,
    activeCall,
    callNotice,
    startCall,
    endCall,
  } = useLiveStream();

  const handleBack = () => {
    leave();
    onBack?.();
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        {isJoined && remoteUid ? (
          <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.video} />
        ) : (
          <View style={styles.hero}>
            <Text style={styles.label}>Viewer Lounge</Text>
            <Text style={styles.title}>Join the stream as a viewer</Text>
            <Text style={styles.text}>
              Watch the host, follow the live status, and request a private
              audio or video call.
            </Text>
          </View>
        )}

        <View style={styles.topBar}>
          <View style={styles.pillRow}>
            <Text style={styles.live}>{isJoined ? 'LIVE' : 'READY'}</Text>
            <Text style={styles.timer}>{isJoined ? time : resolvedChannelId}</Text>
          </View>
          <Text style={styles.meta}>
            {isJoined ? `Host • ${activeChannelId}` : `Viewers ${userCount}`}
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
              <Text style={styles.panelTitle}>Live ID</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setChannelId}
                placeholder="Enter stream ID"
                placeholderTextColor="#7C8596"
                style={styles.input}
                value={channelId}
              />

              <Text style={styles.helper}>
                Viewer page only joins as audience. Use the host page to start
                the broadcast.
              </Text>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.button, styles.viewerButton]}
                onPress={joinAsGuest}
              >
                <Text style={styles.buttonText}>Join as Viewer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Viewer Controls</Text>
              {activeCall ? (
                <Text style={styles.helper}>
                  {activeCall.callType === 'audio'
                    ? 'Audio call connected.'
                    : 'Video call connected.'}
                </Text>
              ) : outgoingCall ? (
                <View style={styles.row}>
                  <ActivityIndicator color="#38BDF8" />
                  <Text style={styles.helper}>
                    Sending {outgoingCall.callType} call request to host...
                  </Text>
                </View>
              ) : (
                <Text style={styles.helper}>
                  Request a private call when you want one-on-one support.
                </Text>
              )}

              {incomingCall ? (
                <Text style={styles.helper}>
                  Incoming host response: {incomingCall.callType} call.
                </Text>
              ) : null}

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              {!outgoingCall && !activeCall ? (
                <View style={styles.callRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.audioButton]}
                    onPress={() => startCall('audio')}
                  >
                    <Text style={styles.buttonText}>Audio Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.videoButton]}
                    onPress={() => startCall('video')}
                  >
                    <Text style={styles.buttonText}>Video Call</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {(incomingCall || outgoingCall || activeCall) && (
                <TouchableOpacity style={styles.endCall} onPress={endCall}>
                  <Text style={styles.buttonText}>End Call</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.endButton} onPress={leave}>
                <Text style={styles.buttonText}>Exit Live</Text>
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

export default ViewerLiveStreamScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    flex: 1,
  },
  hero: {
    position: 'absolute',
    top: 64,
    left: 16,
    right: 16,
    zIndex: 2,
    gap: 10,
  },
  label: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  text: {
    color: '#CBD5E1',
    lineHeight: 20,
    maxWidth: 420,
  },
  video: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    zIndex: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  live: {
    backgroundColor: '#F43F5E',
    color: '#fff',
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
    position: 'absolute',
    top: 72,
    left: 16,
    right: 16,
    backgroundColor: '#0F172AE6',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    zIndex: 3,
  },
  noticeText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  bottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    gap: 12,
    zIndex: 3,
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
    fontSize: 15,
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
    flexShrink: 1,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
  callRow: {
    flexDirection: 'row',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  button: {
    minHeight: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    flex: 1,
  },
  viewerButton: {
    backgroundColor: '#0EA5E9',
    flex: 0,
  },
  audioButton: {
    backgroundColor: '#0EA5E9',
  },
  videoButton: {
    backgroundColor: '#8B5CF6',
  },
  endButton: {
    backgroundColor: '#FF3B30',
    minHeight: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCall: {
    backgroundColor: '#F97316',
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
    color: '#38BDF8',
    fontWeight: '700',
  },
});

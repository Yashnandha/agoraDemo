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

const HostLiveStreamScreen = ({ onBack }: Props) => {
  const {
    isJoined,
    isHost,
    remoteUid,
    channelId,
    setChannelId,
    activeChannelId,
    errorMessage,
    joinAsHost,
    leave,
    userCount,
    time,
    isMicOn,
    toggleMic,
    switchCamera,
    incomingCall,
    activeCall,
    callNotice,
    acceptIncomingCall,
    rejectIncomingCall,
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
        {isJoined ? (
          <View style={styles.videoWrap}>
            <RtcSurfaceView canvas={{ uid: 0 }} style={styles.video} />
          </View>
        ) : (
          <View style={styles.hero}>
            <Text style={styles.label}>Host Studio</Text>
            <Text style={styles.title}>Create the live room</Text>
            <Text style={styles.text}>
              Start the stream as host, then handle incoming viewer calls from
              the same screen.
            </Text>
          </View>
        )}

        <View style={styles.topBar}>
          <View style={styles.pillRow}>
            <Text style={styles.live}>{isJoined ? 'LIVE' : 'READY'}</Text>
            <Text style={styles.timer}>{isJoined ? time : '00:00'}</Text>
          </View>

          <Text style={styles.meta}>
            {isJoined
              ? remoteUid
                ? `Viewer ID ${remoteUid}`
                : `Viewers ${userCount}`
              : 'Host only'}
          </Text>
        </View>

        {callNotice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{callNotice}</Text>
          </View>
        ) : null}

        {incomingCall ? (
          <View style={styles.overlay}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Incoming Call</Text>
              <Text style={styles.cardTitle}>
                {incomingCall.callType === 'audio' ? 'Audio call' : 'Video call'}
              </Text>
              <Text style={styles.cardText}>
                A viewer is requesting a {incomingCall.callType} call on{' '}
                {activeChannelId}.
              </Text>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.button, styles.declineButton]}
                  onPress={rejectIncomingCall}
                >
                  <Text style={styles.buttonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.acceptButton]}
                  onPress={acceptIncomingCall}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
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
                This screen is host-only. Viewers should use the viewer page.
              </Text>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <TouchableOpacity
                style={[styles.button, styles.hostButton]}
                onPress={joinAsHost}
              >
                <Text style={styles.buttonText}>Join as Host</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Broadcast Controls</Text>
              <Text style={styles.meta}>
                {isHost ? 'Streaming as host' : `Viewing ${activeChannelId}`}
              </Text>

              {remoteUid ? (
                <Text style={styles.helper}>
                  Viewer connected. Remote UID: {remoteUid}
                </Text>
              ) : (
                <Text style={styles.helper}>Waiting for viewers to join.</Text>
              )}

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.iconBtn]} onPress={toggleMic}>
                  <Text style={styles.icon}>{isMicOn ? '🎙' : '🔇'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={switchCamera}>
                  <Text style={styles.icon}>🔄</Text>
                </TouchableOpacity>
              </View>

              {(incomingCall || activeCall) && (
                <TouchableOpacity style={styles.endCall} onPress={endCall}>
                  <Text style={styles.buttonText}>End Call</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.endButton} onPress={leave}>
                <Text style={styles.buttonText}>End Stream</Text>
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

export default HostLiveStreamScreen;

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
  videoWrap: {
    flex: 1,
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
  overlay: {
    position: 'absolute',
    top: '28%',
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 4,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#020617F2',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    gap: 12,
  },
  cardLabel: {
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '800',
    fontSize: 12,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
  },
  cardText: {
    color: '#CBD5E1',
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    minHeight: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  hostButton: {
    backgroundColor: '#F97316',
  },
  acceptButton: {
    backgroundColor: '#10B981',
    flex: 1,
  },
  declineButton: {
    backgroundColor: '#EF4444',
    flex: 1,
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
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0F172ACC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  icon: {
    color: '#fff',
    fontSize: 18,
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

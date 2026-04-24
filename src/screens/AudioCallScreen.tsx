import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLiveStream } from './useLiveStream';

type Props = {
  onBack?: () => void;
};

const AudioCallScreen = ({ onBack }: Props) => {
  const {
    isJoined,
    isHost,
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
  } = useLiveStream();

  const handleBack = () => {
    leave();
    onBack?.();
  };

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.label}>Audio Call</Text>
          <Text style={styles.title}>Voice-first calling screen</Text>
          <Text style={styles.text}>
            This standalone page focuses on voice calls, mic status, and host
            approval flow.
          </Text>
        </View>

        <View style={styles.statusBar}>
          <Text style={styles.live}>{isJoined ? 'CONNECTED' : 'READY'}</Text>
          <Text style={styles.timer}>{isJoined ? time : resolvedChannelId}</Text>
        </View>

        {callNotice ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{callNotice}</Text>
          </View>
        ) : null}

        {incomingCall ? (
          <View style={styles.centerCard}>
            <Text style={styles.cardTitle}>Incoming audio call</Text>
            <Text style={styles.cardText}>
              Host can approve or reject the viewer request.
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

        <View style={styles.bottom}>
          {!isJoined ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Join Audio Room</Text>
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
                Use this page when the conversation should stay voice-only.
              </Text>

              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : null}

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.button, styles.hostButton]}
                  onPress={joinAsHost}
                >
                  <Text style={styles.buttonText}>Host Audio</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.viewerButton]}
                  onPress={joinAsGuest}
                >
                  <Text style={styles.buttonText}>Viewer Audio</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>
                {isHost ? 'Host Audio Session' : 'Viewer Audio Session'}
              </Text>
              <Text style={styles.helper}>
                {activeChannelId} is live. Mic status stays visible here.
              </Text>

              {outgoingCall ? (
                <Text style={styles.helper}>
                  Requesting {outgoingCall.callType} call from the host...
                </Text>
              ) : activeCall ? (
                <Text style={styles.helper}>
                  {activeCall.callType === 'audio'
                    ? 'Audio call connected.'
                    : 'Video call connected.'}
                </Text>
              ) : (
                <Text style={styles.helper}>
                  {isHost
                    ? 'Waiting for a viewer to request an audio call.'
                    : 'Tap below to start an audio call with the host.'}
                </Text>
              )}

              <View style={styles.centerRow}>
                <TouchableOpacity style={styles.micButton} onPress={toggleMic}>
                  <Text style={styles.micIcon}>{isMicOn ? '🎙' : '🔇'}</Text>
                </TouchableOpacity>
              </View>

              {!isHost && !outgoingCall && !activeCall ? (
                <TouchableOpacity
                  style={[styles.button, styles.audioCallButton]}
                  onPress={() => startCall('audio')}
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
                <Text style={styles.buttonText}>Leave Audio Room</Text>
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

export default AudioCallScreen;

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
  hero: {
    gap: 10,
    marginBottom: 20,
  },
  label: {
    color: '#10B981',
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  live: {
    color: '#fff',
    backgroundColor: '#10B981',
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
  centerCard: {
    backgroundColor: '#020617F2',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 18,
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
  },
  cardText: {
    color: '#CBD5E1',
    lineHeight: 20,
  },
  bottom: {
    marginTop: 'auto',
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
  centerRow: {
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
  audioCallButton: {
    backgroundColor: '#10B981',
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
  micButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#0F172ACC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  micIcon: {
    color: '#fff',
    fontSize: 22,
  },
  backButton: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backText: {
    color: '#10B981',
    fontWeight: '700',
  },
});

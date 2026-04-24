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

const LiveStreamScreen = () => {
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
    userCount,
    time,
    isMicOn,
    toggleMic,
    switchCamera,
    incomingCall,
    outgoingCall,
    activeCall,
    callNotice,
    startCall,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
  } = useLiveStream();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 🎥 VIDEO */}
      {isJoined && isHost ? (
        <RtcSurfaceView canvas={{ uid: 0 }} style={styles.video} />
      ) : isJoined && activeCall && !isHost ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            {activeCall.callType === 'audio'
              ? 'Audio call active'
              : 'Video call active'}
          </Text>
          <Text style={styles.text}>
            Live stream playback is paused while the call is active.
          </Text>
        </View>
      ) : isJoined && remoteUid ? (
        <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.video} />
      ) : (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            {isJoined
              ? isHost
                ? 'You are live now'
                : `Waiting for host on ${activeChannelId}`
              : 'Start or join a live stream'}
          </Text>
          <Text style={styles.text}>
            {isJoined
              ? `Live ID: ${activeChannelId}`
              : 'Enter a Live ID below, then choose how you want to join.'}
          </Text>
        </View>
      )}

      {/* 🔴 TOP */}
      <View style={styles.topBar}>
        <View style={styles.liveBox}>
          <Text style={styles.live}>{isJoined ? 'LIVE' : 'READY'}</Text>
          <Text style={styles.timer}>
            {isJoined ? time : resolvedChannelId}
          </Text>
        </View>

        <View style={styles.viewer}>
          <Text style={styles.viewerText}>
            {isJoined
              ? `${isHost ? 'Host' : 'Viewer'} • ${activeChannelId}`
              : `Viewers ${userCount}`}
          </Text>
        </View>
      </View>

      {callNotice ? (
        <View style={styles.callNotice}>
          <Text style={styles.callNoticeText}>{callNotice}</Text>
        </View>
      ) : null}

      {incomingCall && isHost ? (
        <View style={styles.incomingOverlay}>
          <View style={styles.incomingCard}>
            <Text style={styles.incomingLabel}>Incoming Call</Text>
            <Text style={styles.incomingTitle}>
              {incomingCall.callType === 'audio' ? 'Audio call' : 'Video call'}
            </Text>
            <Text style={styles.incomingText}>
              Viewer is requesting a {incomingCall.callType} call on{' '}
              {activeChannelId}.
            </Text>

            <View style={styles.incomingActions}>
              <TouchableOpacity
                style={[styles.incomingBtn, styles.declineBtn]}
                onPress={rejectIncomingCall}
              >
                <Text style={styles.btnText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.incomingBtn, styles.acceptBtn]}
                onPress={acceptIncomingCall}
              >
                <Text style={styles.btnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}

      {/* 🎛 HOST CONTROLS */}
      {isJoined && isHost && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleMic}>
            <Text style={styles.icon}>{isMicOn ? '🎙' : '🔇'}</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.controlBtn} onPress={toggleCamera}>
            <Text style={styles.icon}>{isCameraOn ? '📷' : '🚫📷'}</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.controlBtn} onPress={switchCamera}>
            <Text style={styles.icon}>🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🔽 BOTTOM */}
      <View style={styles.bottom}>
        {!isJoined ? (
          <View style={styles.entryCard}>
            <Text style={styles.label}>Live ID</Text>
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
              Hosts create the stream with this ID. Viewers join using the same
              ID.
            </Text>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btn, styles.hostBtn]}
                onPress={joinAsHost}
              >
                <Text style={styles.btnText}>Join as Host</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.guestBtn]}
                onPress={joinAsGuest}
              >
                <Text style={styles.btnText}>Join as Viewer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.liveCard}>
            <View style={styles.liveMeta}>
              <Text style={styles.liveMetaLabel}>
                {isHost ? 'Hosting' : 'Viewing'}
              </Text>
              <Text style={styles.liveMetaValue}>{activeChannelId}</Text>
            </View>

            {outgoingCall && !isHost ? (
              <View style={styles.callState}>
                <ActivityIndicator color="#38BDF8" />
                <Text style={styles.callStateText}>
                  Calling host with {outgoingCall.callType} call...
                </Text>
              </View>
            ) : activeCall && !isHost ? (
              <View style={styles.callState}>
                <Text style={styles.callStateText}>
                  {activeCall.callType === 'audio'
                    ? 'Audio call connected'
                    : 'Video call connected'}
                </Text>
              </View>
            ) : null}

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {!isHost && isJoined && !outgoingCall && !activeCall ? (
              <View style={styles.callActions}>
                <Text style={styles.callTitle}>Call host</Text>
                <View style={styles.callButtonRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.audioBtn]}
                    onPress={() => startCall('audio')}
                  >
                    <Text style={styles.btnText}>Audio Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btn, styles.videoBtn]}
                    onPress={() => startCall('video')}
                  >
                    <Text style={styles.btnText}>Video Call</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            {(incomingCall || outgoingCall || activeCall) && (
              <TouchableOpacity style={styles.endCall} onPress={endCall}>
                <Text style={styles.btnText}>End Call</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.end} onPress={leave}>
              <Text style={styles.btnText}>
                {isHost ? 'End Stream' : 'Exit Live'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default LiveStreamScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050816' },
  video: { flex: 1 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  text: {
    color: '#98A2B3',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  topBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  liveBox: { flexDirection: 'row', gap: 8 },
  live: {
    backgroundColor: '#F43F5E',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    fontWeight: '700',
  },

  timer: {
    color: '#fff',
    backgroundColor: '#0F172ACC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },

  viewer: {
    backgroundColor: '#0F172ACC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    maxWidth: '58%',
  },

  viewerText: { color: '#E2E8F0', fontWeight: '600' },

  callNotice: {
    position: 'absolute',
    top: 98,
    left: 16,
    right: 16,
    backgroundColor: '#0F172AE6',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  callNoticeText: {
    color: '#E2E8F0',
    fontWeight: '600',
  },

  incomingOverlay: {
    position: 'absolute',
    top: '28%',
    left: 16,
    right: 16,
    alignItems: 'center',
  },

  incomingCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#020617F2',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    gap: 12,
  },

  incomingLabel: {
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    fontSize: 12,
  },

  incomingTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
  },

  incomingText: {
    color: '#CBD5E1',
    lineHeight: 20,
  },

  incomingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },

  incomingBtn: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  acceptBtn: {
    backgroundColor: '#10B981',
  },

  declineBtn: {
    backgroundColor: '#EF4444',
  },

  controls: {
    position: 'absolute',
    right: 15,
    bottom: 250,
    gap: 15,
  },

  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0F172ACC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },

  icon: { color: '#fff', fontSize: 18 },

  bottom: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
  },

  entryCard: {
    backgroundColor: '#020617E6',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },

  label: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
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

  btn: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  hostBtn: {
    backgroundColor: '#F97316',
  },

  guestBtn: {
    backgroundColor: '#0EA5E9',
  },

  liveCard: {
    backgroundColor: '#020617E6',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 14,
  },

  callActions: {
    gap: 10,
  },

  callTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },

  callButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },

  audioBtn: {
    backgroundColor: '#0EA5E9',
  },

  videoBtn: {
    backgroundColor: '#8B5CF6',
  },

  callState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },

  callStateText: {
    color: '#E2E8F0',
    fontWeight: '600',
    flexShrink: 1,
  },

  endCall: {
    backgroundColor: '#F97316',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },

  liveMeta: {
    gap: 4,
  },

  liveMetaLabel: {
    color: '#94A3B8',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  liveMetaValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },

  end: {
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },

  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

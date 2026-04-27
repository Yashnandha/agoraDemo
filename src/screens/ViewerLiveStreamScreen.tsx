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
import { SafeAreaView } from 'react-native-safe-area-context';
import { RtcSurfaceView } from 'react-native-agora';
import { useLiveStream } from './useLiveStream';

type Props = { onBack?: () => void };

export default function ViewerLiveStreamScreen({ onBack }: Props) {
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
    isMicOn,
    isCameraOn,
    toggleMic,
    toggleCamera,
    outgoingCall,
    activeCall,
    callNotice,
    startCall,
    endCall,
    isHostBusyOnCall,
    hostBusyCallType,
    isStreamEnded,
  } = useLiveStream();

  const handleLeave = () => {
    leave();
    onBack?.();
  };

  const isVideoCall = activeCall?.callType === 'video';
  const isCallActive = !!activeCall;
  const isWaiting = !!outgoingCall && !activeCall;

  // Hide host video for bystanders during a video call (both streams muted)
  const showHostVideo = remoteUid && !(isHostBusyOnCall && hostBusyCallType === 'video');

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Video layer ── */}
      {isJoined && showHostVideo ? (
        <>
          <RtcSurfaceView canvas={{ uid: remoteUid! }} style={s.fullVideo} />
          {isVideoCall && (
            <View style={s.pip}>
              <RtcSurfaceView canvas={{ uid: 0 }} style={s.pipVideo} />
            </View>
          )}
        </>
      ) : (
        <View style={s.darkBg} />
      )}

      <View style={s.gradTop} pointerEvents="none" />
      <View style={s.gradBottom} pointerEvents="none" />

      <SafeAreaView style={s.overlay} edges={['top', 'bottom']}>

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <View style={s.topLeft}>
            <View style={[s.pill, isJoined && remoteUid ? s.pillLive : s.pillReady]}>
              <Text style={s.pillLiveText}>{isJoined && remoteUid ? 'LIVE' : 'READY'}</Text>
            </View>
            <View style={s.pill}>
              <Text style={s.pillText}>
                {isJoined ? time : resolvedChannelId}
              </Text>
            </View>
            {/* Audio call badge: host busy but video still showing */}
            {isJoined && isHostBusyOnCall && hostBusyCallType === 'audio' && (
              <View style={s.busyBadge}>
                <Text style={s.busyBadgeText}>On Audio Call</Text>
              </View>
            )}
          </View>
          <View style={s.topRight}>
            {isJoined && (
              <View style={s.pill}>
                <Text style={s.pillText}>{activeChannelId}</Text>
              </View>
            )}
            <TouchableOpacity style={s.closeBtn} onPress={handleLeave}>
              <Text style={s.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Notice toast ── */}
        {callNotice ? (
          <View style={s.toast}>
            <Text style={s.toastText}>{callNotice}</Text>
          </View>
        ) : null}

        {/* ── Pre-join card ── */}
        {!isJoined && (
          <View style={s.preJoin}>
            <Text style={s.preLabel}>Viewer Lounge</Text>
            <Text style={s.preTitle}>Join the live</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setChannelId}
              placeholder="Enter stream ID"
              placeholderTextColor="#475569"
              style={s.input}
              value={channelId}
            />
            {errorMessage ? (
              <Text style={s.errorText}>{errorMessage}</Text>
            ) : null}
            <TouchableOpacity style={s.joinBtn} onPress={joinAsGuest}>
              <Text style={s.joinBtnText}>Watch Live</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Stream ended overlay ── */}
        {isStreamEnded && (
          <View style={s.streamEndedOverlay}>
            <Text style={s.streamEndedIcon}>📡</Text>
            <Text style={s.streamEndedTitle}>Stream has ended</Text>
            <Text style={s.streamEndedSub}>The host has stopped the livestream</Text>
            <TouchableOpacity style={s.streamEndedBtn} onPress={handleLeave}>
              <Text style={s.streamEndedBtnText}>Leave</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Host busy on video call overlay (for bystanders) ── */}
        {isJoined && isHostBusyOnCall && hostBusyCallType === 'video' && !isCallActive && !isStreamEnded && (
          <View style={s.hostBusyOverlay}>
            <Text style={s.hostBusyIcon}>📵</Text>
            <Text style={s.hostBusyTitle}>Host is on a video call</Text>
            <Text style={s.hostBusySub}>Livestream paused — back soon</Text>
          </View>
        )}

        {/* ── Waiting for host ── */}
        {isJoined && !remoteUid && !isCallActive && !isWaiting && !isStreamEnded && (
          <View style={s.waitingCenter}>
            <ActivityIndicator color="#fff" size="large" />
            <Text style={s.waitingText}>Waiting for host…</Text>
          </View>
        )}

        {/* ── Outgoing call overlay ── */}
        {isWaiting && (
          <View style={s.outgoingOverlay}>
            <View style={s.outgoingCard}>
              <ActivityIndicator color="#fff" size="large" />
              <Text style={s.outgoingTitle}>
                {outgoingCall?.callType === 'video' ? 'Video' : 'Audio'} call request sent
              </Text>
              <Text style={s.outgoingSub}>Waiting for host to accept…</Text>
              <TouchableOpacity style={s.cancelBtn} onPress={endCall}>
                <Text style={s.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Bottom controls ── */}
        {isJoined && !isWaiting && !isStreamEnded && (
          <View style={s.bottomBar}>

            {/* Active call controls */}
            {isCallActive && (
              <>
                <Text style={s.activeCallLabel}>
                  {activeCall?.callType === 'video' ? 'Video' : 'Audio'} call connected
                </Text>
                <View style={s.controlsShelf}>
                  <View style={s.ctrlItem}>
                    <TouchableOpacity
                      style={[s.ctrlCircle, !isMicOn && s.ctrlCircleOff]}
                      onPress={toggleMic}
                    >
                      <Text style={s.ctrlSymbol}>{isMicOn ? '♦' : '⊗'}</Text>
                    </TouchableOpacity>
                    <Text style={s.ctrlLabel}>{isMicOn ? 'Mic' : 'Muted'}</Text>
                  </View>

                  {isVideoCall && (
                    <View style={s.ctrlItem}>
                      <TouchableOpacity
                        style={[s.ctrlCircle, !isCameraOn && s.ctrlCircleOff]}
                        onPress={toggleCamera}
                      >
                        <Text style={s.ctrlSymbol}>{isCameraOn ? '■' : '⊟'}</Text>
                      </TouchableOpacity>
                      <Text style={s.ctrlLabel}>{isCameraOn ? 'Camera' : 'Off'}</Text>
                    </View>
                  )}

                  <View style={s.ctrlItem}>
                    <TouchableOpacity style={[s.ctrlCircle, s.ctrlEndCall]} onPress={endCall}>
                      <Text style={s.ctrlSymbol}>✕</Text>
                    </TouchableOpacity>
                    <Text style={s.ctrlLabel}>End Call</Text>
                  </View>
                </View>
              </>
            )}

            {/* Call initiation */}
            {!isCallActive && (
              <View style={[s.callInitRow, isHostBusyOnCall && s.callInitRowDisabled]}>
                <Text style={s.callInitLabel}>
                  {isHostBusyOnCall ? 'Host is busy on a call' : 'Call the host'}
                </Text>
                <View style={s.callInitBtns}>
                  <TouchableOpacity
                    style={[s.callTypeBtn, s.audioCallBtn, isHostBusyOnCall && s.callTypeBtnDisabled]}
                    onPress={() => startCall('audio')}
                    disabled={isHostBusyOnCall}
                  >
                    <Text style={s.callTypeBtnText}>Audio Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.callTypeBtn, s.videoCallBtn, isHostBusyOnCall && s.callTypeBtnDisabled]}
                    onPress={() => startCall('video')}
                    disabled={isHostBusyOnCall}
                  >
                    <Text style={s.callTypeBtnText}>Video Call</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const CTRL_SIZE = 62;
const PIP_W = 110;
const PIP_H = 150;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  fullVideo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  darkBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0a0a0f' },

  pip: {
    position: 'absolute',
    top: 110,
    right: 14,
    width: PIP_W,
    height: PIP_H,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  pipVideo: { flex: 1 },

  gradTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  gradBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 1,
  },

  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 5,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  topLeft: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  topRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },

  pill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pillLive: { backgroundColor: '#E1306C' },
  pillReady: { backgroundColor: 'rgba(80,80,80,0.7)' },
  pillLiveText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  pillText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  busyBadge: {
    backgroundColor: 'rgba(234,179,8,0.85)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  busyBadgeText: { color: '#000', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  // Notice toast
  toast: {
    marginHorizontal: 14,
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'flex-start',
  },
  toastText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Pre-join
  preJoin: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  preLabel: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  preTitle: { color: '#fff', fontSize: 36, fontWeight: '800', lineHeight: 42 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    color: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: { color: '#f87171', fontSize: 13 },
  joinBtn: {
    backgroundColor: '#818CF8',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  joinBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Stream ended overlay
  streamEndedOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 30,
  },
  streamEndedIcon: { fontSize: 52 },
  streamEndedTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  streamEndedSub: { color: 'rgba(255,255,255,0.55)', fontSize: 15, textAlign: 'center', paddingHorizontal: 32 },
  streamEndedBtn: {
    marginTop: 20,
    backgroundColor: '#818CF8',
    borderRadius: 14,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  streamEndedBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Host busy overlay (video call)
  hostBusyOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    zIndex: 15,
  },
  hostBusyIcon: { fontSize: 48 },
  hostBusyTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  hostBusySub: { color: 'rgba(255,255,255,0.55)', fontSize: 15 },

  // Waiting for host
  waitingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  waitingText: { color: 'rgba(255,255,255,0.6)', fontSize: 16 },

  // Outgoing call waiting
  outgoingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  outgoingCard: {
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 32,
  },
  outgoingTitle: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
  outgoingSub: { color: 'rgba(255,255,255,0.55)', fontSize: 15, textAlign: 'center' },
  cancelBtn: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  activeCallLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  controlsShelf: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ctrlItem: { alignItems: 'center', gap: 6 },
  ctrlCircle: {
    width: CTRL_SIZE,
    height: CTRL_SIZE,
    borderRadius: CTRL_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  ctrlCircleOff: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  ctrlEndCall: { backgroundColor: '#EF4444' },
  ctrlSymbol: { color: '#fff', fontSize: 20, fontWeight: '700' },
  ctrlLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },

  // Call initiation
  callInitRow: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 24,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  callInitRowDisabled: {
    borderColor: 'rgba(255,165,0,0.3)',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  callInitLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  callInitBtns: { flexDirection: 'row', gap: 10 },
  callTypeBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  callTypeBtnDisabled: { opacity: 0.35 },
  audioCallBtn: { backgroundColor: '#0EA5E9' },
  videoCallBtn: { backgroundColor: '#8B5CF6' },
  callTypeBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

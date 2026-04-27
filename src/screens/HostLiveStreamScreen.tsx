import React from 'react';
import {
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

export default function HostLiveStreamScreen({ onBack }: Props) {
  const {
    isJoined,
    remoteUid,
    channelId,
    setChannelId,
    activeChannelId,
    errorMessage,
    joinAsHost,
    endStream,
    userCount,
    time,
    isMicOn,
    isCameraOn,
    toggleMic,
    toggleCamera,
    switchCamera,
    incomingCall,
    activeCall,
    callNotice,
    acceptIncomingCall,
    rejectIncomingCall,
    endCall,
  } = useLiveStream();

  const handleLeave = () => {
    endStream();
    onBack?.();
  };

  const isVideoCall = activeCall?.callType === 'video';
  const isOnCall = !!activeCall;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Video layer ── */}
      {isJoined ? (
        <>
          {isOnCall ? (
            // Call mode: show caller video (video call) or dark bg (audio call)
            isVideoCall && remoteUid ? (
              <>
                <RtcSurfaceView canvas={{ uid: remoteUid }} style={s.fullVideo} />
                <View style={s.pip}>
                  <RtcSurfaceView canvas={{ uid: 0 }} style={s.pipVideo} />
                </View>
              </>
            ) : (
              <View style={s.callBg} />
            )
          ) : (
            // Livestream mode: show own camera
            <RtcSurfaceView canvas={{ uid: 0 }} style={s.fullVideo} />
          )}
        </>
      ) : (
        <View style={s.darkBg} />
      )}

      <View style={[s.gradTop, isOnCall && s.gradTopCall]} pointerEvents="none" />
      <View style={s.gradBottom} pointerEvents="none" />

      <SafeAreaView style={s.overlay} edges={['top', 'bottom']}>

        {/* ── Top bar ── */}
        <View style={s.topBar}>
          <View style={s.topLeft}>
            {isJoined && (
              <>
                <View style={[s.pill, isOnCall ? s.pillCall : s.pillLive]}>
                  <Text style={s.pillLiveText}>{isOnCall ? 'IN CALL' : 'LIVE'}</Text>
                </View>
                <View style={s.pill}>
                  <Text style={s.pillText}>{time}</Text>
                </View>
              </>
            )}
          </View>
          <View style={s.topRight}>
            {isJoined && !isOnCall && (
              <View style={s.pill}>
                <Text style={s.pillText}>{userCount} watching</Text>
              </View>
            )}
            {isJoined && isOnCall && (
              <View style={s.pill}>
                <Text style={s.pillText}>
                  {activeCall?.callType === 'video' ? 'Video' : 'Audio'} · {activeChannelId}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={s.closeBtn}
              onPress={isOnCall ? endCall : handleLeave}
            >
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
            <Text style={s.preLabel}>Host Studio</Text>
            <Text style={s.preTitle}>Go live</Text>
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
            <TouchableOpacity style={s.goLiveBtn} onPress={joinAsHost}>
              <Text style={s.goLiveBtnText}>Start Live</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Incoming call overlay ── */}
        {incomingCall && (
          <View style={s.incomingOverlay}>
            <View style={s.incomingCard}>
              <View style={s.callerCircle}>
                <Text style={s.callerInitial}>V</Text>
              </View>
              <Text style={s.callerName}>Viewer</Text>
              <Text style={s.callerType}>
                Incoming {incomingCall.callType === 'video' ? 'video' : 'audio'} call
              </Text>
              <View style={s.callActionRow}>
                <View style={s.callActionGroup}>
                  <TouchableOpacity
                    style={[s.callActionCircle, s.declineCircle]}
                    onPress={rejectIncomingCall}
                  >
                    <Text style={s.callActionSymbol}>✕</Text>
                  </TouchableOpacity>
                  <Text style={s.callActionLabel}>Decline</Text>
                </View>
                <View style={s.callActionGroup}>
                  <TouchableOpacity
                    style={[s.callActionCircle, s.acceptCircle]}
                    onPress={acceptIncomingCall}
                  >
                    <Text style={s.callActionSymbol}>✓</Text>
                  </TouchableOpacity>
                  <Text style={s.callActionLabel}>Accept</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Call UI (active call) ── */}
        {isJoined && isOnCall && !incomingCall && (
          <View style={s.bottomBar}>
            <View style={s.callerInfoRow}>
              <View style={s.callerAvatarSmall}>
                <Text style={s.callerAvatarText}>V</Text>
              </View>
              <View>
                <Text style={s.callerInfoName}>Viewer</Text>
                <Text style={s.callerInfoSub}>
                  {activeCall?.callType === 'video' ? 'Video' : 'Audio'} call · {time}
                </Text>
              </View>
            </View>

            <View style={s.controlsShelf}>
              {/* Mic */}
              <View style={s.ctrlItem}>
                <TouchableOpacity
                  style={[s.ctrlCircle, !isMicOn && s.ctrlCircleOff]}
                  onPress={toggleMic}
                >
                  <Text style={s.ctrlSymbol}>{isMicOn ? '♦' : '⊗'}</Text>
                </TouchableOpacity>
                <Text style={s.ctrlLabel}>{isMicOn ? 'Mic' : 'Muted'}</Text>
              </View>

              {/* Camera (video call only) */}
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

              {/* End call */}
              <View style={s.ctrlItem}>
                <TouchableOpacity style={[s.ctrlCircle, s.ctrlEndCall]} onPress={endCall}>
                  <Text style={s.ctrlSymbol}>✕</Text>
                </TouchableOpacity>
                <Text style={s.ctrlLabel}>End Call</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Livestream controls ── */}
        {isJoined && !isOnCall && !incomingCall && (
          <View style={s.bottomBar}>
            <View style={s.controlsShelf}>
              {/* Mic */}
              <View style={s.ctrlItem}>
                <TouchableOpacity
                  style={[s.ctrlCircle, !isMicOn && s.ctrlCircleOff]}
                  onPress={toggleMic}
                >
                  <Text style={s.ctrlSymbol}>{isMicOn ? '♦' : '⊗'}</Text>
                </TouchableOpacity>
                <Text style={s.ctrlLabel}>{isMicOn ? 'Mic' : 'Muted'}</Text>
              </View>

              {/* Camera */}
              <View style={s.ctrlItem}>
                <TouchableOpacity
                  style={[s.ctrlCircle, !isCameraOn && s.ctrlCircleOff]}
                  onPress={toggleCamera}
                >
                  <Text style={s.ctrlSymbol}>{isCameraOn ? '■' : '⊟'}</Text>
                </TouchableOpacity>
                <Text style={s.ctrlLabel}>{isCameraOn ? 'Camera' : 'Off'}</Text>
              </View>

              {/* Flip */}
              <View style={s.ctrlItem}>
                <TouchableOpacity style={s.ctrlCircle} onPress={switchCamera}>
                  <Text style={s.ctrlSymbol}>↺</Text>
                </TouchableOpacity>
                <Text style={s.ctrlLabel}>Flip</Text>
              </View>

              {/* End live */}
              <View style={s.ctrlItem}>
                <TouchableOpacity style={[s.ctrlCircle, s.ctrlEndStream]} onPress={handleLeave}>
                  <Text style={s.ctrlSymbol}>■</Text>
                </TouchableOpacity>
                <Text style={s.ctrlLabel}>End Live</Text>
              </View>
            </View>
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
  callBg: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0f0f1a',
  },

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
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  gradTopCall: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  gradBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
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
  topLeft: { flexDirection: 'row', gap: 8, alignItems: 'center' },
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
  pillCall: { backgroundColor: '#22C55E' },
  pillLiveText: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  pillText: { color: '#fff', fontWeight: '600', fontSize: 13 },

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

  // Notice
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
    color: '#E1306C',
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
  goLiveBtn: {
    backgroundColor: '#E1306C',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  goLiveBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Incoming call overlay
  incomingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  incomingCard: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  callerCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#5B4FCF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 8,
  },
  callerInitial: { color: '#fff', fontSize: 40, fontWeight: '700' },
  callerName: { color: '#fff', fontSize: 22, fontWeight: '700' },
  callerType: { color: 'rgba(255,255,255,0.65)', fontSize: 15, marginBottom: 28 },

  callActionRow: {
    flexDirection: 'row',
    gap: 56,
    marginTop: 8,
  },
  callActionGroup: { alignItems: 'center', gap: 10 },
  callActionCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineCircle: { backgroundColor: '#EF4444' },
  acceptCircle: { backgroundColor: '#22C55E' },
  callActionSymbol: { color: '#fff', fontSize: 26, fontWeight: '700' },
  callActionLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Caller info row (active call)
  callerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  callerAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5B4FCF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callerAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  callerInfoName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  callerInfoSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500' },

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
  ctrlEndStream: { backgroundColor: '#EF4444' },
  ctrlSymbol: { color: '#fff', fontSize: 20, fontWeight: '700' },
  ctrlLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },
});

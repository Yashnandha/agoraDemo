import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { RtcSurfaceView } from 'react-native-agora';
import { useLiveStream } from './useLiveStream';

const LiveStreamScreen = () => {
  const {
    isJoined,
    isHost,
    setIsHost,
    remoteUid,
    join,
    leave,
    userCount,
    time,
    isMicOn,
    isCameraOn,
    toggleMic,
    toggleCamera,
    switchCamera,
  } = useLiveStream();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 🎥 VIDEO */}
      {isJoined && isHost ? (
        <RtcSurfaceView canvas={{ uid: 0 }} style={styles.video} />
      ) : isJoined && remoteUid ? (
        <RtcSurfaceView canvas={{ uid: remoteUid }} style={styles.video} />
      ) : (
        <View style={styles.center}>
          <Text style={styles.text}>Start Live Stream</Text>
        </View>
      )}

      {/* 🔴 TOP */}
      <View style={styles.topBar}>
        <View style={styles.liveBox}>
          <Text style={styles.live}>LIVE</Text>
          <Text style={styles.timer}>{time}</Text>
        </View>

        <View style={styles.viewer}>
          <Text style={styles.viewerText}>👁 {userCount}</Text>
        </View>
      </View>

      {/* 🎛 HOST CONTROLS */}
      {isJoined && isHost && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={toggleMic}>
            <Text style={styles.icon}>{isMicOn ? '🎙' : '🔇'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={toggleCamera}>
            <Text style={styles.icon}>{isCameraOn ? '📷' : '🚫📷'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={switchCamera}>
            <Text style={styles.icon}>🔄</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🔁 ROLE SWITCH */}
      <View style={styles.switchBox}>
        <Text style={styles.role}>Audience</Text>
        <Switch value={isHost} onValueChange={setIsHost} />
        <Text style={styles.role}>Host</Text>
      </View>

      {/* 🔽 BOTTOM */}
      <View style={styles.bottom}>
        {!isJoined ? (
          <TouchableOpacity style={styles.btn} onPress={join}>
            <Text style={styles.btnText}>
              {isHost ? 'Go Live' : 'Join Live'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.end} onPress={leave}>
            <Text style={styles.btnText}>End</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default LiveStreamScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#aaa' },

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
    backgroundColor: 'red',
    color: '#fff',
    padding: 6,
    borderRadius: 6,
  },

  timer: {
    color: '#fff',
    backgroundColor: '#00000080',
    padding: 6,
    borderRadius: 6,
  },

  viewer: {
    backgroundColor: '#00000080',
    padding: 6,
    borderRadius: 20,
  },

  viewerText: { color: '#fff' },

  controls: {
    position: 'absolute',
    right: 15,
    bottom: 120,
    gap: 15,
  },

  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: { color: '#fff', fontSize: 18 },

  switchBox: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: '#00000080',
    padding: 10,
    borderRadius: 20,
  },

  role: { color: '#fff' },

  bottom: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },

  btn: {
    backgroundColor: '#7C3AED',
    padding: 14,
    borderRadius: 30,
  },

  end: {
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 30,
  },

  btnText: { color: '#fff', fontWeight: 'bold' },
});

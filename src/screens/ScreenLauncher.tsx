import React, { useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AudioCallScreen from './AudioCallScreen';
import HostLiveStreamScreen from './HostLiveStreamScreen';
import VideoCallScreen from './VideoCallScreen';
import ViewerLiveStreamScreen from './ViewerLiveStreamScreen';

type ScreenKey = 'menu' | 'host' | 'viewer' | 'audio' | 'video';

const ScreenLauncher = () => {
  const [screen, setScreen] = useState<ScreenKey>('menu');

  if (screen === 'host') {
    return <HostLiveStreamScreen onBack={() => setScreen('menu')} />;
  }

  if (screen === 'viewer') {
    return <ViewerLiveStreamScreen onBack={() => setScreen('menu')} />;
  }

  if (screen === 'audio') {
    return <AudioCallScreen onBack={() => setScreen('menu')} />;
  }

  if (screen === 'video') {
    return <VideoCallScreen onBack={() => setScreen('menu')} />;
  }

  return (
    <View style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.container}>
        <Text style={styles.kicker}>Agora Demo</Text>
        <Text style={styles.title}>Standalone live, audio, and video screens</Text>
        <Text style={styles.subtitle}>
          Choose a page to open. Each screen lives in its own file and can be
          used independently.
        </Text>

        <View style={styles.cardGrid}>
          <TouchableOpacity
            style={[styles.card, styles.hostCard]}
            onPress={() => setScreen('host')}
          >
            <Text style={styles.cardTitle}>Host</Text>
            <Text style={styles.cardText}>
              Open the broadcast view with host controls and stream preview.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.viewerCard]}
            onPress={() => setScreen('viewer')}
          >
            <Text style={styles.cardTitle}>Viewer</Text>
            <Text style={styles.cardText}>
              Join as a viewer, watch the live feed, and request a call.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.audioCard]}
            onPress={() => setScreen('audio')}
          >
            <Text style={styles.cardTitle}>Audio Call</Text>
            <Text style={styles.cardText}>
              Use the dedicated audio call screen for voice-only sessions.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.card, styles.videoCard]}
            onPress={() => setScreen('video')}
          >
            <Text style={styles.cardTitle}>Video Call</Text>
            <Text style={styles.cardText}>
              Use the dedicated video call screen with camera controls.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ScreenLauncher;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#050816',
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  kicker: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 24,
  },
  cardGrid: {
    gap: 14,
  },
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#020617E6',
    gap: 8,
  },
  hostCard: {
    borderColor: '#F97316',
  },
  viewerCard: {
    borderColor: '#0EA5E9',
  },
  audioCard: {
    borderColor: '#10B981',
  },
  videoCard: {
    borderColor: '#8B5CF6',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  cardText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
});

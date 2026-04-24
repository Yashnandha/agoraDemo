/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-agora', () => {
  const MockReact = require('react');
  const { View: MockView } = require('react-native');

  const mockEngine = {
    initialize: jest.fn().mockResolvedValue(undefined),
    registerEventHandler: jest.fn(),
    unregisterEventHandler: jest.fn(),
    joinChannel: jest.fn().mockReturnValue(0),
    leaveChannel: jest.fn(),
    enableVideo: jest.fn(),
    startPreview: jest.fn(),
    stopPreview: jest.fn(),
    release: jest.fn(),
    muteLocalAudioStream: jest.fn(),
    muteLocalVideoStream: jest.fn(),
    switchCamera: jest.fn(),
  };

  return {
    RtcSurfaceView: (props: any) => MockReact.createElement(MockView, props),
    createAgoraRtcEngine: jest.fn(() => mockEngine),
    AudienceLatencyLevelType: {
      AudienceLatencyLevelUltraLowLatency: 1,
    },
    ChannelProfileType: {
      ChannelProfileLiveBroadcasting: 1,
    },
    ClientRoleType: {
      ClientRoleBroadcaster: 1,
      ClientRoleAudience: 2,
    },
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenLauncher from './src/screens/ScreenLauncher';

const App = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
      }}
    >
      <ScreenLauncher />
    </SafeAreaView>
  );
};

export default App;

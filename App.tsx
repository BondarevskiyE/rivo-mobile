import React from 'react';
import {SafeAreaView, StatusBar} from 'react-native';
import Routes from './src/routes';
import {Colors} from './src/constants';

const App = () => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.ui_background}}>
      <StatusBar backgroundColor={Colors.ui_background} />
      <Routes />
    </SafeAreaView>
  );
};

export default App;

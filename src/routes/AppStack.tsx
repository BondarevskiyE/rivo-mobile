import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {HomeScreen, SettingsScreen} from '@/screens';

import {useLoginStore} from '@/store/useLoginStore';
import {PassCode} from '@/widgets/PassCode/PassCode';

const Tab = createBottomTabNavigator();

export const AppStack = () => {
  const isPassCodeEntered = useLoginStore(state => state.isPassCodeEntered);

  if (!isPassCodeEntered) {
    return <PassCode />;
  }
  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#281034',
  },
});

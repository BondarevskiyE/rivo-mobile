import React from 'react';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {LoginScreen} from '@/screens';
import {SafeAreaView, StyleSheet} from 'react-native';
import {Colors} from '@/shared/ui';

const Stack = createStackNavigator();

export const AuthStack = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true,
          headerShown: false,
          ...TransitionPresets.SlideFromRightIOS,
        }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui_background,
  },
});

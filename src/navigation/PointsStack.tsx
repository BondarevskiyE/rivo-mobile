import {TransitionPresets, createStackNavigator} from '@react-navigation/stack';

import {POINTS_SCREENS, PointsStackProps} from './types/pointsStack';
import {PointsMenuScreen} from '@/screens/points/PointsMenuScreen';
import {LeaderboardScreen} from '@/screens/points/LeaderboardScreen';
import {PointsHistoryScreen} from '@/screens/points/PointsHistoryScreen';

const Stack = createStackNavigator<PointsStackProps>();

export const PointsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
        headerShown: false,
      }}>
      <Stack.Screen
        name={POINTS_SCREENS.POINTS_MENU_SCREEN}
        component={PointsMenuScreen}
        options={{
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen
        name={POINTS_SCREENS.LEADERBOARD_SCREEN}
        component={LeaderboardScreen}
        options={{
          gestureEnabled: true,
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
      <Stack.Screen
        name={POINTS_SCREENS.POINTS_HISTORY_SCREEN}
        component={PointsHistoryScreen}
        options={{
          gestureEnabled: true,
          ...TransitionPresets.SlideFromRightIOS,
        }}
      />
    </Stack.Navigator>
  );
};

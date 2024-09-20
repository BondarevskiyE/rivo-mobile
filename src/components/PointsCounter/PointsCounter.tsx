import {StyleSheet, Text, Pressable} from 'react-native';

import * as RootNavigation from '@/navigation/RootNavigation';
import {Colors, Fonts} from '@/shared/ui';
import {usePointsStore} from '@/store/usePointsStore';
import {ROOT_STACKS} from '@/navigation/types/rootStack';

export const PointsCounter = () => {
  const points = usePointsStore(state => state.points);

  const handleGoToPointsMenu = () => {
    RootNavigation.navigate(ROOT_STACKS.POINTS_STACK);
  };

  return (
    <Pressable onPress={handleGoToPointsMenu} style={styles.container}>
      <Text style={styles.text}>{`${points} Points`}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 75,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.ui_orange_20,
  },
  text: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    lineHeight: 20.3,
    textAlign: 'center',
    // letterSpacing: -4,
    color: Colors.ui_orange_80,
  },
});

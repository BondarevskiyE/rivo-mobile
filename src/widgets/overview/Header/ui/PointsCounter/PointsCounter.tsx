import {Colors, Fonts} from '@/shared/ui';
import {usePointsStore} from '@/store/usePointsStore';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export const PointsCounter = () => {
  const points = usePointsStore(state => state.points);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{`${points} Points`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 75,
    borderRadius: 40,
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

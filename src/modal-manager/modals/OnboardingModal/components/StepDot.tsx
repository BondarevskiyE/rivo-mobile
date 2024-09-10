import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/shared/ui';

interface Props {
  isActive: boolean;
}

export const StepDot: React.FC<Props> = ({isActive}) => {
  return (
    <View
      style={[
        styles.dot,
        {backgroundColor: isActive ? Colors.ui_orange_80 : Colors.ui_beige_50},
      ]}
    />
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

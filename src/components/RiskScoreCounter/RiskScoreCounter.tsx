import React from 'react';

import {StyleSheet, Text, View} from 'react-native';
import {
  COUNTER_HEIGHT,
  COUNTER_WIDTH,
  POINTER_DIAMETER,
  getPointerBottomPosition,
  getPointerLeftPosition,
  getRiskScoreColor,
} from './lib';
import {RiskScoreCounterIcon} from '@/shared/ui/icons';
import {Colors, Fonts} from '@/shared/ui';

interface Props {
  percent: number;
}

export const RiskScoreCounter: React.FC<Props> = ({percent}) => {
  const riskScoreColor = getRiskScoreColor(percent);

  return (
    <View style={styles.container}>
      <View style={styles.counterContainer}>
        <RiskScoreCounterIcon style={styles.counter} />
        <View
          style={[
            styles.counterPointer,
            {
              backgroundColor: riskScoreColor,
              left: getPointerLeftPosition(+percent),
              bottom: getPointerBottomPosition(+percent),
            },
          ]}
        />
        <View style={styles.percentTextContainer}>
          <Text style={[styles.percentText, {color: riskScoreColor}]}>
            {percent ? (+percent / 20).toFixed(1) : '-'}
          </Text>
          <Text style={styles.percentStaticText}>
            {percent ? 'out of 5' : '-'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  counterContainer: {
    position: 'relative',
    width: COUNTER_WIDTH,
    height: COUNTER_HEIGHT,
    marginBottom: 10,
  },
  counter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    width: 209,
    height: 61,
  },

  counterPointer: {
    position: 'absolute',

    width: POINTER_DIAMETER,
    height: POINTER_DIAMETER,
    borderWidth: 2,
    borderColor: Colors.ui_white,

    borderRadius: 50,
  },
  percentTextContainer: {
    position: 'absolute',
    left: '50%',
    bottom: -10,
    width: 79,
    transform: [
      {
        translateX: -39.5,
      },
    ],
  },
  percentText: {
    textAlign: 'center',

    fontFamily: Fonts.medium,

    fontSize: 44,
    color: Colors.ui_black_63,
  },
  percentStaticText: {
    textAlign: 'center',

    fontFamily: Fonts.regular,

    color: Colors.ui_grey_70,
  },
});

import React, {useEffect, useRef} from 'react';
import {Alert, Dimensions, StyleSheet, View} from 'react-native';
import ReAnimated, {
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {initialWindowMetrics} from 'react-native-safe-area-context';

import {
  DragUpFromBottom,
  DragUpFromBottomRefProps,
} from '@/components/panGestureModals';
import {Strategy} from '@/shared/types';
import {AboutVaultContent} from './AboutVaultContent';
import {BUTTON_TYPE, Button} from '@/components/general/Button/Button';
import {Fonts} from '@/shared/ui';
import {ScrollView} from 'react-native-gesture-handler';

const {width} = Dimensions.get('window');

interface Props {
  vault: Strategy;
  playDragAnimation: (value: number) => void;
  isBig: boolean;
}

// below the screen
const INITIAL_TRANSLATE_Y = 600;

export const VaultAboutDragBlock: React.FC<Props> = ({
  vault,
  playDragAnimation,
  isBig,
}) => {
  const scrollref = useRef<ScrollView>(null);
  const positionValue = useSharedValue(70);
  const imageShiftValue = useSharedValue(0);

  const ref = useRef<DragUpFromBottomRefProps>(null);

  useEffect(() => {
    setTimeout(() => {
      ref?.current?.scrollTo(0);
    }, 100);
  }, []);

  useEffect(() => {
    positionValue.value = withTiming(isBig ? 140 : 70);
  }, [isBig, positionValue]);

  const onPlayDragAnimation = (value: number) => {
    'worklet';
    playDragAnimation(value);
    imageShiftValue.value = withSpring(value, {
      stiffness: 180,
      damping: 30,
      mass: 1,
    });
  };

  return (
    <ReAnimated.View style={[styles.container, {top: positionValue}]}>
      <DragUpFromBottom
        ref={ref}
        initialTranslateY={INITIAL_TRANSLATE_Y}
        translateYOffset={isBig ? 70 : 0}
        playDragAnimation={onPlayDragAnimation}
        simultaneousExternalGesture={scrollref}>
        <AboutVaultContent vault={vault} imageShiftValue={imageShiftValue} />
      </DragUpFromBottom>
      <View style={styles.buttonContainer}>
        <Button
          text="Invest"
          style={styles.investButton}
          textStyle={styles.investButtonText}
          type={BUTTON_TYPE.ACTION_SECONDARY}
          onPress={() => Alert.alert('invest!')}
        />
      </View>
    </ReAnimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 0,
    top: 70,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: (initialWindowMetrics?.insets.bottom || 0) + 16,
    width: width - 12 - 12,
    left: 12,
  },
  investButton: {
    height: 56,
    borderRadius: 28,
  },
  investButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
});

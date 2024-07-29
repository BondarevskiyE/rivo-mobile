import React, {useEffect, useRef} from 'react';
import {StyleSheet} from 'react-native';
import ReAnimated, {useSharedValue, withSpring} from 'react-native-reanimated';

import {
  DragUpFromBottom,
  DragUpFromBottomRefProps,
} from '@/components/panGestureModals';
import {Strategy} from '@/shared/types';
import {AboutVaultContent} from './AboutVaultContent';

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
  const ref = useRef<DragUpFromBottomRefProps>(null);
  const containerSizeValue = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      ref?.current?.scrollTo(0);
    }, 100);
  }, []);

  useEffect(() => {
    if (isBig) {
      containerSizeValue.value = withSpring(140, {
        stiffness: 177.8,
        damping: 20,
        mass: 1,
      });
      return;
    }
    containerSizeValue.value = withSpring(70, {
      stiffness: 177.8,
      damping: 20,
      mass: 1,
    });
  }, [containerSizeValue, isBig]);

  return (
    <ReAnimated.View style={[styles.container, {top: containerSizeValue}]}>
      <DragUpFromBottom
        ref={ref}
        initialTranslateY={INITIAL_TRANSLATE_Y}
        playDragAnimation={playDragAnimation}>
        <AboutVaultContent vault={vault} />
      </DragUpFromBottom>
    </ReAnimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

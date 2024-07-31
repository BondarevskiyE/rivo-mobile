import React, {useEffect, useRef} from 'react';
import {StyleSheet} from 'react-native';
import ReAnimated, {useSharedValue, withTiming} from 'react-native-reanimated';

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
  const positionValue = useSharedValue(70);
  const ref = useRef<DragUpFromBottomRefProps>(null);

  useEffect(() => {
    setTimeout(() => {
      ref?.current?.scrollTo(0);
    }, 100);
  }, []);

  useEffect(() => {
    positionValue.value = withTiming(isBig ? 140 : 70);
  }, [isBig, positionValue]);

  return (
    <ReAnimated.View style={[styles.container, {top: positionValue}]}>
      <DragUpFromBottom
        ref={ref}
        initialTranslateY={INITIAL_TRANSLATE_Y}
        translateYOffset={isBig ? 70 : 0}
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
    top: 70,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

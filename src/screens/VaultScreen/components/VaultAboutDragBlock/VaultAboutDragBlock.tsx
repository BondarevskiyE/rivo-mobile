import React, {useEffect, useRef} from 'react';
import {StyleSheet, View} from 'react-native';

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

  useEffect(() => {
    setTimeout(() => {
      ref?.current?.scrollTo(0);
    }, 100);
  }, []);

  return (
    <View style={[styles.container, {top: isBig ? 140 : 70}]}>
      <DragUpFromBottom
        ref={ref}
        initialTranslateY={INITIAL_TRANSLATE_Y}
        translateYOffset={isBig ? 70 : 0}
        playDragAnimation={playDragAnimation}>
        <AboutVaultContent vault={vault} />
      </DragUpFromBottom>
    </View>
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

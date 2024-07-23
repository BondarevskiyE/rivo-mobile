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
}

// below the screen
const INITIAL_TRANSLATE_Y = 600;

export const VaultAboutDragBlock: React.FC<Props> = ({vault}) => {
  const ref = useRef<DragUpFromBottomRefProps>(null);

  useEffect(() => {
    setTimeout(() => {
      ref?.current?.scrollTo(0);
    }, 100);
  }, []);

  return (
    <View style={styles.container}>
      <DragUpFromBottom ref={ref} initialTranslateY={INITIAL_TRANSLATE_Y}>
        <AboutVaultContent vault={vault} />
      </DragUpFromBottom>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    top: 70,
    height: 0,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

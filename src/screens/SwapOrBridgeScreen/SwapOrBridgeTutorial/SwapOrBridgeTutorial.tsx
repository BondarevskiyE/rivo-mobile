import React, {useRef} from 'react';
import {CellRendererProps, FlatList, StyleSheet, View} from 'react-native';

import {
  STEP_HEIGHT,
  STEP_WIDTH,
  SwapOrBridgeTutorialStep,
} from './SwapOrBridgeTutorialStep';
import {tutorialSteps} from './tutorialSteps';
import {Colors} from '@/shared/ui';

export const SwapOrBridgeTutorial = () => {
  const carouselRef = useRef<FlatList>(null);

  const onGoToStep = (stepindex: number) => {
    carouselRef.current?.scrollToIndex({index: stepindex});
  };

  const cellRenderer = ({
    children,
    index,
    style,
    ...props
  }: CellRendererProps<any>) => {
    return (
      <View
        style={[
          style,
          {
            position: 'relative',
            // for goToNextStep arrow buttons hovering
            zIndex: -index,
            elevation: -index,
          },
        ]}
        {...props}>
        {children}
      </View>
    );
  };

  const allStepsAmount = tutorialSteps.length;

  return (
    <View style={styles.container}>
      <FlatList
        data={tutorialSteps}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        overScrollMode="never"
        directionalLockEnabled
        showsHorizontalScrollIndicator={false}
        horizontal
        contentInset={{left: 13, right: 13}}
        bounces={false}
        decelerationRate="fast"
        disableIntervalMomentum
        snapToAlignment={'start'}
        snapToInterval={STEP_WIDTH + 13}
        CellRendererComponent={cellRenderer}
        renderItem={({item, index}) => (
          <SwapOrBridgeTutorialStep
            stepNumber={index + 1}
            text={item.text}
            withCopyHandler={item.withCopyHandler}
            onGoToStep={onGoToStep}
            allStepsAmount={allStepsAmount}
            image={item.imageUrl}
          />
        )}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        ref={carouselRef}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 28,
  },
  list: {
    overflow: 'visible',
  },
  listContent: {
    gap: 13,
  },
  nextSlideContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.ui_gray_83,
    right: -20,
    zIndex: 99999,
    top: STEP_HEIGHT / 2 - 20,

    justifyContent: 'center',
    alignItems: 'center',
  },
});

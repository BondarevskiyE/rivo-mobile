import React, {useEffect} from 'react';
import {ImageBackground, Pressable, StyleSheet, Text, View} from 'react-native';

import {useUserStore} from '@/store/useUserStore';
import {onboardingData} from '@/shared/config/onboardingData';
import {Colors, Fonts} from '@/shared/ui';
import {GradientText} from '../general/GradientText';
import {CardShineIcon} from '@/shared/ui/icons';
import ReAnimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {openOnboardingModal} from '@/modal-manager';

const SHINE_INTERVAL_TIME = 5000;

export const OnboardingTasks = () => {
  const onboardingStepNumber = useUserStore(state => state.onboardingStep);

  const shineGradientValue = useSharedValue(0);

  const stepData = onboardingData[onboardingStepNumber - 1];

  const onboardingsTasksLength = onboardingData.length;

  useEffect(() => {
    const interval = setInterval(() => {
      shineGradientValue.value = withSequence(
        withTiming(1, {duration: 1700}),
        withTiming(0, {duration: 0}),
      );
      // shineGradientValue.value = 1;
    }, SHINE_INTERVAL_TIME);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressTask = () => {
    if (onboardingStepNumber === 1) {
      openOnboardingModal();
    }
  };

  const shineGradientStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shineGradientValue.value,
          [0, 1],
          [-230, 500],
          Extrapolation.EXTEND,
        ),
      },
    ],
  }));

  return (
    <Pressable style={styles.container} onPress={onPressTask}>
      <ImageBackground source={stepData.image} style={styles.backgroundImage}>
        <ReAnimated.View
          style={[styles.shineGradientContainer, shineGradientStyles]}>
          <CardShineIcon />
        </ReAnimated.View>
        <View style={styles.task}>
          <View>
            <Text
              style={
                styles.stepsCounterText
              }>{`Step ${onboardingStepNumber} of ${onboardingsTasksLength}`}</Text>
            <View>
              <GradientText style={styles.taskTitle}>
                {stepData.title}
              </GradientText>
            </View>
          </View>
          <GradientText
            style={styles.pointsText}
            gradientColors={[
              '#FA8112',
              '#FFAF66',
            ]}>{`+${stepData.points} points`}</GradientText>
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  task: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepsCounterText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_orange_70,
    lineHeight: 14,
    letterSpacing: 0.13,
  },
  taskTitle: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.03,
  },
  pointsText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22.4,
  },
  backgroundImage: {
    position: 'relative',
  },
  shineGradientContainer: {
    position: 'absolute',
    top: -40,
    left: -230,
    width: 40,
    height: '100%',
    zIndex: 3,
  },
});

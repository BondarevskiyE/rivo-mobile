import React from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';

import {useUserStore} from '@/store/useUserStore';
import {onboardingData} from '@/shared/config/onboardingData';
import {Colors, Fonts} from '@/shared/ui';
import {GradientText} from '../general/GradientText';

export const OnboardingTasks = () => {
  const onboardingStepNumber = useUserStore(state => state.onboardingStep);

  const stepData = onboardingData[onboardingStepNumber - 1];

  const onboardingsTasksLength = onboardingData.length;

  return (
    <View style={styles.container}>
      <ImageBackground source={stepData.image}>
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
    </View>
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
});

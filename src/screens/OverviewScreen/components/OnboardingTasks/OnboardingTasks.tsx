import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {useUserStore} from '@/store/useUserStore';
import {onboardingData} from '@/shared/config/onboardingData';
import {Colors, Fonts} from '@/shared/ui';
import {GradientText} from '@/components/general/GradientText';
import {ImageBadge} from '@/components/ImageBadge';

interface Props {
  onPressOnboarding: () => void;
}

export const OnboardingTasks = ({onPressOnboarding}: Props) => {
  const onboardingStepNumber = useUserStore(state => state.onboardingStep);

  const stepData = onboardingData[onboardingStepNumber - 1];

  const onboardingsTasksLength = onboardingData.length;

  const onPressTask = () => {
    if (onboardingStepNumber === 1) {
      onPressOnboarding();
    }
  };

  return (
    <ImageBadge onPress={onPressTask} image={stepData.image} withShine>
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
    </ImageBadge>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  task: {
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

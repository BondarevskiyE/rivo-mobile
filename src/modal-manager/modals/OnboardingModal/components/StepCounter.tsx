import React from 'react';
import { StyleSheet, View } from 'react-native';

import {onboardingSteps} from '../data/steps';
import {StepDot} from './StepDot';

interface Props {
  activeId: string;
}

export const StepCounter: React.FC<Props> = ({activeId}) => {
  return (
    <View style={styles.container}>
      {onboardingSteps.map(step => (
        <StepDot isActive={activeId === step.stepId} key={step.stepId} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
});

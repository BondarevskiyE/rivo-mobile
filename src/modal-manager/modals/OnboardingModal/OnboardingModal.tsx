import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ViewProps,
} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';

import ReAnimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import Modal from '@/modal-manager';
import {
  HIGHLIGHT_ELEMENTS,
  useOnboardingStore,
} from '@/store/useOnboardingStore';
import {Colors, Fonts, Images} from '@/shared/ui';
import {StepCounter} from './components';
import {onboardingSteps} from './data/steps';
import {ArrowLineIcon, CheckIcon} from '@/shared/ui/icons';

type OnboardingModalProps = {
  scrollToOnboardingElement: (id: any) => void;
} & ViewProps;

const {height} = Dimensions.get('screen');

export const ONBOARDING_MODAL_HEIGHT = 321;
const OVERVIEW_HEADER_HEIGHT = 46;
const POINTS_HIGHLIGHT_MODAL_OFFSET = 50;

export const OnboardingModal = ({
  scrollToOnboardingElement,
  ...props
}: OnboardingModalProps) => {
  const animatedPositionValue = useSharedValue(0);

  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const highlightElement = useOnboardingStore(state => state.highlightElement);

  const activeStep = onboardingSteps[activeStepIndex];
  const isTheLastStep = activeStepIndex + 1 === onboardingSteps.length;

  useEffect(() => {
    if (activeStep.position === 'top') {
      // modal lifting animation
      animatedPositionValue.value = withTiming(1, {duration: 500});
    }

    if (activeStep.scrollable) {
      scrollToOnboardingElement(activeStep.highlightElement);
      highlightElement(HIGHLIGHT_ELEMENTS.NONE);
      // Timeout for removing fade overlay while scrolling
      setTimeout(() => {
        highlightElement(activeStep.highlightElement);
      }, 300);
      return;
    }
    highlightElement(activeStep.highlightElement);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  const onPressNextButton = () => {
    if (isTheLastStep) {
      Modal.hide();
      return;
    }
    setActiveStepIndex(index => index + 1);
  };

  const positionStyles = useAnimatedStyle(() => {
    if (activeStep.position === 'top') {
      return {
        transform: [
          {
            translateY: interpolate(
              animatedPositionValue.value,
              [0, 1],
              [
                0,
                -(
                  height -
                  ONBOARDING_MODAL_HEIGHT -
                  (initialWindowMetrics?.insets?.top || 0) -
                  OVERVIEW_HEADER_HEIGHT -
                  POINTS_HIGHLIGHT_MODAL_OFFSET
                ),
              ],
              Extrapolation.IDENTITY,
            ),
          },
        ],
      };
    }
    return {};
  });

  return (
    <ReAnimated.View style={[modalStyles.container, positionStyles]} {...props}>
      <Image source={Images.onboardingCat} style={modalStyles.catImage} />
      <View style={modalStyles.contentBlock}>
        <View style={modalStyles.content}>
          <StepCounter activeId={activeStep.stepId} />

          <ReAnimated.View
            key={`onboarding-modal-text-${activeStepIndex}-slide`}
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}>
            <Text style={modalStyles.text}>{activeStep.text}</Text>
          </ReAnimated.View>
        </View>
        <View style={modalStyles.buttonsBlock}>
          <TouchableHighlight
            activeOpacity={0.6}
            underlayColor={Colors.ui_beige_20}
            onPress={Modal.hide}>
            <Text style={modalStyles.skipButtonText}>Skip</Text>
          </TouchableHighlight>
          <Pressable style={modalStyles.nextButton} onPress={onPressNextButton}>
            {isTheLastStep ? <CheckIcon /> : <ArrowLineIcon />}
          </Pressable>
        </View>
      </View>
    </ReAnimated.View>
  );
};

interface OpenOnboardingModalParams<T> {
  scrollToOnboardingElement: (id: T) => void;
}

export function openOnboardingModal<ScrollElementId>({
  scrollToOnboardingElement,
}: OpenOnboardingModalParams<ScrollElementId>) {
  const clearHighlight = useOnboardingStore.getState().clearHighlight;
  Modal.show({
    children: (
      <OnboardingModal scrollToOnboardingElement={scrollToOnboardingElement} />
    ),
    dismissable: true,
    position: 'floatBottom',
    backdropOpacity: 0,
    onHide: clearHighlight,
  });
}

const modalStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    borderRadius: 24,
    bottom: 0,
    width: '100%',
    overflow: 'hidden',
    height: ONBOARDING_MODAL_HEIGHT,
    backgroundColor: Colors.ui_beige_20,
  },
  catImage: {
    height: 105,
    width: '100%',
  },
  contentBlock: {
    alignSelf: 'stretch',
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  text: {
    fontFamily: Fonts.medium,
    fontSize: 18,
    lineHeight: 25.2,
    color: Colors.ui_black_80,
  },
  buttonsBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 13,
    paddingRight: 9,
    paddingBottom: 6,
  },
  skipButton: {},
  skipButtonText: {
    color: Colors.ui_orange_80,
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22.4,
  },
  nextButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.ui_orange_80,
  },
});

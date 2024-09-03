import React from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

import {Colors, Fonts} from '@/shared/ui';
import {ArrowLineIcon} from '@/shared/ui/icons';
import {useUserStore} from '@/store/useUserStore';

export const STEP_WIDTH = 296;
export const STEP_HEIGHT = 194;

interface Props {
  stepNumber: number;
  allStepsAmount: number;
  onGoToStep: (stepIndex: number) => void;
  image: ImageSourcePropType;
  text: string;
  withCopyHandler?: boolean;
}

export const SwapOrBridgeTutorialStep: React.FC<Props> = ({
  stepNumber,
  onGoToStep,
  allStepsAmount,
  image,
  text,
  withCopyHandler,
}) => {
  const userWalletAddress = useUserStore(state => state.walletAddress);

  const gotToNextStep = () => {
    // stepNumber is an index + 1, so the next index will be equal stepNumber
    onGoToStep(stepNumber);
  };

  const onCopyUserAddress = () => {
    Clipboard.setString(userWalletAddress);
  };

  const isLastStep = stepNumber === allStepsAmount;

  return (
    <>
      <View style={[styles.container, {zIndex: -stepNumber}]}>
        <ImageBackground source={image} resizeMode="cover" style={styles.image}>
          <View style={styles.contentContainer}>
            <Text
              style={
                styles.stepCounterText
              }>{`Step ${stepNumber} of ${allStepsAmount}`}</Text>
            <Pressable
              onPress={withCopyHandler ? onCopyUserAddress : undefined}>
              <Text style={styles.stepText}>{text}</Text>
            </Pressable>
          </View>
        </ImageBackground>
      </View>
      {!isLastStep && (
        <Pressable style={styles.nextSlideContainer} onPress={gotToNextStep}>
          <ArrowLineIcon color={Colors.ui_white} />
        </Pressable>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.ui_black_65,
    borderRadius: 32,
    width: STEP_WIDTH,
    height: STEP_HEIGHT,
  },
  image: {
    flex: 1,
    height: STEP_HEIGHT,
    padding: 20,
  },
  nextSlideContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.ui_gray_83,
    right: -26.6,
    zIndex: 4,
    top: STEP_HEIGHT / 2 - 20,

    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    top: '47%',
  },
  stepCounterText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_orange_80,
    marginBottom: 7,
  },
  stepText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_white,
    lineHeight: 20.3,
    letterSpacing: -0.53,
  },
});

import React, {useEffect} from 'react';
import {Image, StyleSheet, Text, View, ViewProps} from 'react-native';

import Modal from '@/modal-manager';
import {
  HIGHLIGHT_ELEMENTS,
  useOnboardingStore,
} from '@/store/useOnboardingStore';
import {Colors, Images} from '@/shared/ui';
import {Button} from '@/components';

type OnboardingModalProps = ViewProps;

export const OnboardingModal = ({...props}: OnboardingModalProps) => {
  const highlightElement = useOnboardingStore(state => state.highlightElement);
  const clearHighlight = useOnboardingStore(state => state.clearHighlight);

  useEffect(() => {
    highlightElement(HIGHLIGHT_ELEMENTS.CASH_ACCOUNT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={modalStyles.container} {...props}>
      <Image source={Images.onboardingCat} style={modalStyles.catImage} />
      <View style={modalStyles.content}>
        <Text>Hello</Text>
        <Button
          text="next"
          onPress={() => {
            clearHighlight();
            setTimeout(() => {
              highlightElement(HIGHLIGHT_ELEMENTS.STRATEGIES_LIST);
            }, 500);
          }}
        />
      </View>
    </View>
  );
};

export const openOnboardingModal = () => {
  const clearHighlight = useOnboardingStore.getState().clearHighlight;
  Modal.show({
    children: <OnboardingModal />,
    dismissable: true,
    position: 'floatBottom',
    backdropOpacity: 0,
    onHide: clearHighlight,
  });
};

const modalStyles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 313,
    backgroundColor: Colors.ui_beige_20,
  },
  catImage: {
    height: 105,
    width: '100%',
  },
  content: {
    alignSelf: 'stretch',
  },
});

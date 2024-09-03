import {Dimensions, StyleSheet} from 'react-native';
import {
  ModalConfig,
  ModalData,
  ModalHideParams,
  ModalOptions,
  ModalShowParams,
} from '../types';
import RNModal from 'react-native-modal';
import React, {useCallback} from 'react';

export type ModalUIProps = {
  isVisible: boolean;
  options: ModalOptions;
  data: ModalData;
  show: (params: ModalShowParams) => void;
  hide: (params: ModalHideParams) => void;
  config?: ModalConfig;
  onHide: () => void;
};

export const FLOAT_BOTTOM_MODAL_MARGIN = 24;
export const FLOAT_TOP_MODAL_MARGIN = 24;

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('screen');

export const ModalUI = ({
  isVisible,
  data,
  options,
  hide,
  onHide,
  config,
}: ModalUIProps) => {
  const {children} = data;
  const {style} = config || {};

  const {
    dismissable,
    position,
    backdropOpacity = 0.4,
    animationIn,
    animationInTiming,
    animationOut,
    animationOutTiming,
    backdropTransitionInTiming,
    backdropTransitionOutTiming,
  } = options;

  const onBackdropPress = useCallback(() => {
    if (dismissable) {
      hide({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissable]);

  const onModalHide = useCallback(() => {
    onHide();
  }, [onHide]);

  if (!children) {
    return null;
  }

  return (
    <RNModal
      {...RNModal.defaultProps}
      isVisible={isVisible}
      // useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      animationIn={animationIn}
      animationInTiming={animationInTiming}
      animationOut={animationOut}
      animationOutTiming={animationOutTiming}
      backdropTransitionInTiming={backdropTransitionInTiming}
      backdropTransitionOutTiming={backdropTransitionOutTiming}
      deviceHeight={SCREEN_HEIGHT}
      deviceWidth={SCREEN_WIDTH}
      style={[modalPositionStyles[position], styles.modal, style]}
      onBackdropPress={onBackdropPress}
      avoidKeyboard={false}
      onModalHide={onModalHide}
      backdropOpacity={backdropOpacity}>
      {children}
    </RNModal>
  );
};

const modalPositionStyles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    margin: 20,
  },
  bottom: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  floatBottom: {
    justifyContent: 'flex-end',
    marginHorizontal: 12,
    marginBottom: FLOAT_BOTTOM_MODAL_MARGIN,
  },
  floatTop: {
    justifyContent: 'flex-start',
    marginHorizontal: 12,
    marginTop: FLOAT_TOP_MODAL_MARGIN,
  },
  custom: {},
});

const styles = StyleSheet.create({
  modal: {},
});

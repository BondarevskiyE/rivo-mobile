import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import * as RootNavigation from '@/navigation/RootNavigation';
import {CheckShieldIcon, CloseIcon, ArrowLineIcon} from '@/shared/ui/icons';
import {Colors, Fonts} from '@/shared/ui';
import {MenuButton} from '../MenuButton';
import {DEPOSIT_WITHDRAWAL_MODAL_STEPS} from '../types';
import {data} from '../menuMapData';

interface Props {
  onCloseModal: () => void;
  onChangeModalStep: (step: DEPOSIT_WITHDRAWAL_MODAL_STEPS) => void;
  step: DEPOSIT_WITHDRAWAL_MODAL_STEPS;
}

export const MenuModal: React.FC<Props> = ({
  onCloseModal,
  onChangeModalStep,
  step,
}) => {
  const modalData = data[step];

  const goToStep = (newStep: DEPOSIT_WITHDRAWAL_MODAL_STEPS) => {
    onChangeModalStep(newStep);
  };

  const onPressBackButton = () => {
    if (modalData?.backAction) {
      goToStep(modalData.backAction);
      return;
    }
    onCloseModal();
  };

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}
      style={[styles.container, {paddingTop: modalData?.title ? 57 : 72}]}>
      <Pressable onPress={onPressBackButton} style={styles.closeIconContainer}>
        {modalData?.backAction ? (
          <ArrowLineIcon
            style={{transform: [{rotate: '180deg'}]}}
            color={Colors.ui_grey_70}
            width={12}
            height={12}
          />
        ) : (
          <CloseIcon color={Colors.ui_grey_70} width={12} height={12} />
        )}
      </Pressable>
      {modalData?.title && <Text style={styles.title}>{modalData.title}</Text>}
      {modalData?.buttons.map(
        ({Icon, actionStep, actionScreen, text, title, withArrow}) => (
          <MenuButton
            title={title}
            text={text}
            onPress={() => {
              if (actionScreen) {
                RootNavigation.navigate(actionScreen);
                // onCloseModal();
                return;
              }

              if (actionStep) {
                goToStep(actionStep);
              }
            }}
            withArrow={withArrow}
            Icon={Icon}
            key={title}
          />
        ),
      )}
      {modalData?.withProtectedShield && (
        <View style={styles.bottomBlock}>
          <CheckShieldIcon color={Colors.ui_orange_80} />
          <Text style={styles.protectedText}>
            Protected from custodial risks
          </Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingHorizontal: 12,
    paddingTop: 57,
    paddingBottom: 24,
  },
  bottomBlock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,

    marginTop: 12,
  },
  protectedText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_orange_80,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 9,
    left: 9,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ui_grey_04,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    color: Colors.ui_black_80,
    marginBottom: 30,
  },
});

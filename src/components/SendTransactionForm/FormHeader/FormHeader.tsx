import React from 'react';
import {Pressable, View, Text, StyleSheet} from 'react-native';

import {hideElementStyles} from '@/shared/constants/styles';
import {ArrowLineIcon, CloseIcon} from '@/shared/ui/icons';
import {SettingsIcon} from '@/shared/ui/icons/SettingsIcon';
import {SEND_TRANSACTION_FORM_TYPE} from '../types';
import {Colors, Fonts} from '@/shared/ui';
import {getTitleText} from '../helpers';

interface Props {
  onClose: () => void;
  onClickSettings: () => void;
  formType: SEND_TRANSACTION_FORM_TYPE;
  isSlippageOpen: boolean;
  balance: string;
}

export const FormHeader: React.FC<Props> = ({
  onClose,
  onClickSettings,
  formType,
  isSlippageOpen,
  balance,
}) => {
  const titleText = getTitleText(formType, isSlippageOpen);

  return (
    <View style={[styles.headerContainer]}>
      <Pressable
        style={[styles.backIconContainer, isSlippageOpen && hideElementStyles]}
        onPress={onClose}>
        <ArrowLineIcon color={Colors.ui_white} />
      </Pressable>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{titleText}</Text>
        <Text
          style={[
            styles.text,
            styles.greyText,
            isSlippageOpen && styles.displayNone,
          ]}>{`Available balance: $${balance}`}</Text>
      </View>
      {formType === SEND_TRANSACTION_FORM_TYPE.SEND ? (
        <View style={styles.iconMock} />
      ) : (
        <Pressable
          onPress={onClickSettings}
          style={styles.settingsIconContainer}>
          {isSlippageOpen ? <CloseIcon /> : <SettingsIcon />}
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    width: '100%',
  },
  iconMock: {
    width: 36,
  },
  settingsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: Colors.ui_black_65,
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_white,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  greyText: {
    color: Colors.grey_text,
  },
  backIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: Colors.ui_black_65,
    borderRadius: 18,
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
  displayNone: {
    display: 'none',
  },
});

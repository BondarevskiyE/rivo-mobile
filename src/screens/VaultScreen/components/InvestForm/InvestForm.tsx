import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {SettingsIcon} from '@/shared/ui/icons/SettingsIcon';
import {useBalanceStore} from '@/store/useBalanceStore';
import {formatNumber, formatThousandSeparator} from '@/shared/lib/format';
import {InvestKeyboard} from '@/components/InvestKeyboard';
import {useInputFormat} from '@/shared/hooks/useInputFormat';
import {getActionButtonText, getInputFontSize} from './helpers';
import {Button} from '@/components';
import {useZeroDevStore} from '@/store/useZeroDevStore';
import {Vault} from '@/shared/types';

interface Props {
  vault: Vault;
}

export const InvestForm: React.FC<Props> = ({vault}) => {
  const invest = useZeroDevStore(state => state.invest);
  const [isLoading, setIsLoading] = useState(false);

  const {
    onAddSymbol,
    onRemoveSymbol,
    onChangeByPercent,
    inputValue,
    // formattedInputValue,
    additionalValue,
  } = useInputFormat();

  const isInputEmpty = inputValue === '';

  const onPressAmountPercentButton =
    (maxValue: number, percent: number) => () => {
      onChangeByPercent(maxValue, percent);
    };

  const onInvest = async () => {
    setIsLoading(true);
    await invest(vault.token_address, inputValue);
    setIsLoading(false);
  };

  const cashAccountBalance = useBalanceStore(state => state.cashAccountBalance);

  const formattedBalance = formatNumber(cashAccountBalance, 3, ',');

  const actionButtonText = getActionButtonText(
    inputValue,
    cashAccountBalance,
    isLoading,
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.iconMock} />
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Invest</Text>
          <Text
            style={
              styles.titleSubText
            }>{`Available balance: $${formattedBalance}`}</Text>
        </View>
        <View style={styles.settingsIconContainer}>
          <SettingsIcon />
        </View>
      </View>

      <View style={styles.amountTextContainer}>
        <View style={styles.amountTextPositionContainer}>
          <Text style={styles.dollarText}>$</Text>
          <View style={styles.inputTextContainer}>
            <Text
              style={[
                styles.inputText,
                {
                  color: isInputEmpty ? Colors.ui_grey_737 : Colors.ui_white,
                  fontSize: getInputFontSize(String(inputValue).length),
                },
              ]}>
              {formatThousandSeparator(inputValue || 0)}
            </Text>
            {additionalValue && (
              <Text style={[styles.inputText, styles.inputSubText]}>
                {additionalValue}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.percentAmountContainer}>
          <Pressable
            style={styles.percentAmountButton}
            onPress={onPressAmountPercentButton(cashAccountBalance, 25)}>
            <Text style={styles.percentAmountButtonText}>25%</Text>
          </Pressable>
          <Pressable
            style={styles.percentAmountButton}
            onPress={onPressAmountPercentButton(cashAccountBalance, 50)}>
            <Text style={styles.percentAmountButtonText}>50%</Text>
          </Pressable>
          <Pressable
            style={styles.percentAmountButton}
            onPress={onPressAmountPercentButton(cashAccountBalance, 100)}>
            <Text style={styles.percentAmountButtonText}>100%</Text>
          </Pressable>
        </View>
      </View>

      <InvestKeyboard onPress={onAddSymbol} onRemove={onRemoveSymbol} />

      <Button
        onPress={onInvest}
        text={actionButtonText}
        disabled={isInputEmpty || inputValue === '0' || isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 12,
    flex: 1,
    backgroundColor: Colors.ui_black,
  },
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
  titleSubText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.grey_text,
  },
  amountTextContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  amountTextPositionContainer: {
    position: 'relative',
  },
  dollarText: {
    position: 'absolute',
    left: -18,

    fontFamily: Fonts.semiBold,
    fontSize: 24,

    color: Colors.ui_white,
  },
  inputTextContainer: {
    flexDirection: 'row',
  },
  inputText: {
    fontFamily: Fonts.semiBold,
    fontSize: 64,
  },
  inputSubText: {
    color: Colors.ui_grey_737,
  },
  percentAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  percentAmountButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 15,
    backgroundColor: Colors.ui_brown_90,
  },
  percentAmountButtonText: {
    color: Colors.ui_orange_80,
  },
});

import React, {useState} from 'react';
import {Dimensions, Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {GetUserOperationReceiptReturnType} from 'permissionless';

import {Colors, Fonts} from '@/shared/ui';
import {SettingsIcon} from '@/shared/ui/icons/SettingsIcon';
import {useBalanceStore} from '@/store/useBalanceStore';
import {formatNumber} from '@/shared/lib/format';
import {InputAmountKeyboard} from '@/components/InputAmountKeyboard';
import {useInputFormat} from '@/shared/hooks/useInputFormat';
import {Vault} from '@/shared/types';
import {useSettingsStore} from '@/store/useSettingsStore';
import {getCredentialsWithBiometry} from '@/services/keychain';
import {AmountOutput} from './AmountOutput/AmountOutput';
import {
  AutofillButtons,
  SEND_TRANSACTION_FORM_TYPE,
  TEXT_SIGN_POSITION,
  TRANSACTION_STATUS,
} from './types';
import {FormLoader} from './FormLoader';
import {ActionButtons} from './ActionButtons';
import {ArrowLineIcon, CloseIcon} from '@/shared/ui/icons';
import {scannerUrls} from '@/shared/constants';
import {openInAppBrowser} from '@/shared/lib/url';
import {InviteFriendsBadge} from './InviteFriendsBadge';
import {AmountInfo} from './AmountInfo';
import {hideElementStyles} from '@/shared/constants/styles';
import {getTitleText} from './helpers';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  vault: Vault;
  formType: SEND_TRANSACTION_FORM_TYPE;
  onSendTransaction: (
    vault: Vault,
    amount: string,
  ) => Promise<GetUserOperationReceiptReturnType | null>;
  onCloseForm: () => void;
  onCloseScreen: () => void;
  autofillButton?: AutofillButtons;
}

const MAX_SLIPPAGE = 25;

const DefaultAutofillButtons = [
  {name: '25%', percent: 25},
  {name: '50%', percent: 50},
  {name: '100%', percent: 100},
];

const slippageAutofillButtons = [
  {name: '1%', percent: 1},
  {name: '3%', percent: 3},
  {name: '5%', percent: 5},
];

export const SendTransactionForm: React.FC<Props> = ({
  vault,
  onSendTransaction,
  onCloseForm,
  onCloseScreen,
  formType,
  autofillButton = DefaultAutofillButtons,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txStatus, setTxStatus] = useState<TRANSACTION_STATUS>(
    TRANSACTION_STATUS.NONE,
  );
  const [txHash, setTxHash] = useState<string>('');
  const [slippage, setSlippage] = useState<string>('1');
  const [isSlippageOpen, setIsSlippageOpen] = useState<boolean>(false);

  const isBiometryEnabled = useSettingsStore(state => state.isBiometryEnabled);
  const biometryType = useSettingsStore(state => state.biometryType);
  const cashAccountBalance = useBalanceStore(state => state.cashAccountBalance);

  const loadingValue = useSharedValue(0);

  // amount input value
  const {
    onAddSymbol: onAddAmountSymbol,
    onRemoveSymbol: onRemoveAmountSymbol,
    onChangeByPercent: onChangeAmountByPercent,
    inputValue: amountValue,
    additionalValue: additionalAmountValue,
  } = useInputFormat();

  // slippage input value
  const {
    onAddSymbol: onAddSlippageSymbol,
    onRemoveSymbol: onRemoveSlippageSymbol,
    onChangeByPercent: onChangeSlippageByPercent,
    manualChangeValue: manualChangeSlippageValue,
    inputValue: slippageValue,
    additionalValue: additionalSlippageValue,
    isError: isSlippageError,
  } = useInputFormat({maxValue: MAX_SLIPPAGE});

  const onPressPercentButton = (percent: number) => {
    if (isSlippageOpen) {
      onChangeSlippageByPercent(100, percent);
      return;
    }
    onChangeAmountByPercent(cashAccountBalance, percent);
  };

  const onAddSymbol = (symbol: string) => {
    if (isSlippageOpen) {
      onAddSlippageSymbol(symbol);
      return;
    }
    onAddAmountSymbol(symbol);
  };

  const onRemoveSymbol = () => {
    if (isSlippageOpen) {
      onRemoveSlippageSymbol();
      return;
    }
    onRemoveAmountSymbol();
  };

  const onSaveSlippage = () => {
    setSlippage(slippageValue);
    setIsSlippageOpen(false);
  };

  const openLoadingScreen = () => {
    loadingValue.value = withTiming(1, {duration: 500});
  };

  const closeLoadingScreen = () => {
    loadingValue.value = withTiming(0, {duration: 500});
    setTxHash('');
    setTxStatus(TRANSACTION_STATUS.NONE);
  };

  const onSendTx = async () => {
    if (isBiometryEnabled) {
      const credentials = await getCredentialsWithBiometry();

      if (!credentials) {
        return;
      }
    }
    setIsLoading(true);

    openLoadingScreen();

    // setTimeout(() => {
    //   setTxStatus(TRANSACTION_STATUS.SUCCESS);
    //   setIsLoading(false);
    // }, 1000);
    const receipt = await onSendTransaction(vault, amountValue);
    if (receipt) {
      setTxHash(receipt?.receipt.transactionHash);
      setTxStatus(
        receipt.success ? TRANSACTION_STATUS.SUCCESS : TRANSACTION_STATUS.FAIL,
      );
    } else {
      setTxStatus(TRANSACTION_STATUS.FAIL);
    }
    setIsLoading(false);
  };

  const onGoToScanner = () => {
    openInAppBrowser(`${scannerUrls[vault.chain]}/tx/${txHash}`);
  };

  const onGoToSupport = () => {
    openInAppBrowser('https://www.rivo.xyz/');
  };

  const onClickSettings = () => {
    setIsSlippageOpen(prev => !prev);
    manualChangeSlippageValue(slippage);
  };

  const formattedBalance = formatNumber(cashAccountBalance, 3, ',');

  const loadingOpacityStyles = useAnimatedStyle(() => ({
    opacity: interpolate(loadingValue.value, [0, 1], [1, 0]),
    pointerEvents: loadingValue.value ? 'none' : 'auto',
  }));

  const loadingAmountContainerStyles = useAnimatedStyle(() => ({
    top: interpolate(loadingValue.value, [0, 1], [0, 65]),
  }));

  const loaderStyles = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(loadingValue.value, [0, 1], [0.5, 1]),
      },
    ],
    opacity: loadingValue.value,
  }));

  const titleText = getTitleText(formType, isSlippageOpen);

  const isEnoughBalance = +amountValue <= cashAccountBalance;
  const inputValue = isSlippageOpen ? slippageValue : amountValue;
  const isInputZero = inputValue === '' || inputValue === '0';
  const isSendTxButtonDisabled = isInputZero || !isEnoughBalance || isLoading;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.loaderContainer, loaderStyles]}>
        <FormLoader
          isLoading={isLoading}
          formType={formType}
          txStatus={txStatus}
        />
      </Animated.View>

      <View style={styles.resultContainer}>
        <Animated.View style={[styles.headerContainer, loadingOpacityStyles]}>
          <Pressable
            style={[
              styles.backIconContainer,
              isSlippageOpen && hideElementStyles,
            ]}
            onPress={onCloseForm}>
            <ArrowLineIcon color={Colors.ui_white} />
          </Pressable>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{titleText}</Text>
            <Text
              style={[
                styles.text,
                styles.greyText,
                isSlippageOpen && styles.displayNone,
              ]}>{`Available balance: $${formattedBalance}`}</Text>
          </View>
          <Pressable
            onPress={onClickSettings}
            style={styles.settingsIconContainer}>
            {isSlippageOpen ? <CloseIcon /> : <SettingsIcon />}
          </Pressable>
        </Animated.View>

        <Animated.View style={loadingAmountContainerStyles}>
          <AmountOutput
            value={isSlippageOpen ? slippageValue : amountValue}
            textSign={isSlippageOpen ? '%' : '$'}
            textSignPosition={
              isSlippageOpen
                ? TEXT_SIGN_POSITION.RIGHT
                : TEXT_SIGN_POSITION.UP_LEFT
            }
            additionalValue={
              isSlippageOpen ? additionalSlippageValue : additionalAmountValue
            }
            onPressAutofillButton={onPressPercentButton}
            autofillButtons={
              isSlippageOpen ? slippageAutofillButtons : autofillButton
            }
            loadingValue={loadingValue}
            isError={isSlippageOpen ? isSlippageError : !isEnoughBalance}
            key={isSlippageOpen ? 'slippage-value' : 'amount-value'}
          />

          <AmountInfo
            investValue={amountValue}
            isSlippageOpen={isSlippageOpen}
            vaultApy={vault.apy}
            formType={formType}
          />
          {txStatus === TRANSACTION_STATUS.SUCCESS && (
            <Animated.View
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}>
              <InviteFriendsBadge />
            </Animated.View>
          )}
        </Animated.View>
      </View>

      <Animated.View style={[styles.keyboardContainer, loadingOpacityStyles]}>
        <InputAmountKeyboard onPress={onAddSymbol} onRemove={onRemoveSymbol} />
      </Animated.View>

      <ActionButtons
        onSendTx={onSendTx}
        onTryAgain={closeLoadingScreen}
        onCloseScreen={onCloseScreen}
        onGoToScanner={onGoToScanner}
        onGoToSupport={onGoToSupport}
        onSaveSlippage={onSaveSlippage}
        isSlippageOpen={isSlippageOpen}
        isEnoughBalance={isEnoughBalance}
        isDisabled={!isSlippageOpen && isSendTxButtonDisabled}
        isInputEmpty={isInputZero}
        isLoading={isLoading}
        biometryType={isBiometryEnabled ? biometryType : null}
        txStatus={txStatus}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'space-between',
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
  text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  greyText: {
    color: Colors.grey_text,
  },
  resultContainer: {
    marginBottom: 20,
  },
  button: {
    borderRadius: 40,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.ui_white,
  },
  withdrawTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_55,
  },
  keyboardContainer: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    top: 25,
    width: SCREEN_WIDTH,
    transformOrigin: 'bottom',
    zIndex: 9,
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

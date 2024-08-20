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
  TRANSACTION_STATUS,
} from './types';
import {InvestEstimate} from './InvestEstimate';
import {FormLoader} from './FormLoader';
import {ActionButtons} from './ActionButtons';
import {ArrowLineIcon} from '@/shared/ui/icons';
import {scannerUrls} from '@/shared/constants';
import {openInAppBrowser} from '@/shared/lib/url';
import {ImageBadge} from '../ImageBadge';
import {InviteFriendsBadge} from './InviteFriendsBadge';

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

const DefaultAutofillButtons = [
  {name: '25%', percent: 25},
  {name: '50%', percent: 50},
  {name: '100%', percent: 100},
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
  //   const [isSlippageOpen, setIsSlippageOpen] = useState<boolean>(false);

  const isBiometryEnabled = useSettingsStore(state => state.isBiometryEnabled);
  const biometryType = useSettingsStore(state => state.biometryType);
  const cashAccountBalance = useBalanceStore(state => state.cashAccountBalance);

  const loadingValue = useSharedValue(0);

  const {
    onAddSymbol,
    onRemoveSymbol,
    onChangeByPercent,
    inputValue,
    additionalValue,
  } = useInputFormat();

  const onPressAmountPercentButton = (percent: number) => {
    onChangeByPercent(cashAccountBalance, percent);
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

    const receipt = await onSendTransaction(vault, inputValue);

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

  const isInvestForm = formType === SEND_TRANSACTION_FORM_TYPE.INVEST;

  const isEnoughBalance = +inputValue <= cashAccountBalance;
  const isInputZero = inputValue === '' || inputValue === '0';
  const isButtonDisabled = isInputZero || !isEnoughBalance || isLoading;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.loaderContainer, loaderStyles]}>
        <FormLoader
          isLoading={isLoading}
          isInvest={isInvestForm}
          txStatus={txStatus}
        />
      </Animated.View>

      <View style={styles.resultContainer}>
        <Animated.View style={[styles.headerContainer, loadingOpacityStyles]}>
          <Pressable style={[styles.backIconContainer]} onPress={onCloseForm}>
            <ArrowLineIcon color={Colors.ui_white} />
          </Pressable>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>
              {isInvestForm ? 'Invest' : 'Withdraw'}
            </Text>
            <Text
              style={[
                [styles.text, styles.greyText],
              ]}>{`Available balance: $${formattedBalance}`}</Text>
          </View>
          <View style={styles.settingsIconContainer}>
            <SettingsIcon />
          </View>
        </Animated.View>

        <Animated.View style={loadingAmountContainerStyles}>
          <AmountOutput
            value={inputValue}
            additionalValue={additionalValue}
            onPressAutofillButton={onPressAmountPercentButton}
            autofillButtons={autofillButton}
            loadingValue={loadingValue}
          />
          {isInvestForm ? (
            <InvestEstimate value={inputValue} apy={vault.apy} />
          ) : (
            <View style={styles.withdrawTextContainer}>
              <Text style={styles.withdrawText}>
                Funds will be deposited to your Rivo’s Cash Account
              </Text>
            </View>
          )}
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
        isEnoughBalance={isEnoughBalance}
        isDisabled={isButtonDisabled}
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
});

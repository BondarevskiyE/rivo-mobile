import {View, Text, StyleSheet, Dimensions} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect} from 'react';

import {EthereumCircleIcon, DollarIcon} from '@/shared/ui/icons';
import {Colors, Fonts} from '@/shared/ui';
import {TxHistoryTransaction} from '@/shared/types/transactionHistory';
import {getDateTimeString, getTimeString} from '@/shared/helpers/time';
import {LIST_HORIZONTAL_PADDING} from '../constants';
import {FullArrowIcon} from '@/shared/ui/icons/FullArrowIcon';
import {shortenAddress} from '@/shared/lib/format';
import {Button} from '@/components';
import {openInAppBrowser} from '@/shared/helpers/url';
import {chain, chainsMap, scannerUrls} from '@/shared/constants';
import {BUTTON_TYPE} from '@/components/general/Button/Button';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const ICON_SIZE = 36;
const PADDING = 16;

const MODAL_WIDTH = SCREEN_WIDTH - LIST_HORIZONTAL_PADDING * 2;
const MODAL_CONTENT_WIDTH = MODAL_WIDTH - PADDING * 2;

interface Props {
  tx: TxHistoryTransaction;
  isOpen?: boolean;
  animationTime?: number;
}

export const TxHistoryItem: React.FC<Props> = ({
  tx,
  isOpen,
  animationTime = 300,
}) => {
  const openValue = useSharedValue(0);

  useEffect(() => {
    openValue.value = withTiming(isOpen ? 1 : 0, {
      duration: animationTime,
      easing: Easing.inOut(Easing.ease),
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onOpenTransactionInExplorer = () => {
    const explorerUrl = scannerUrls[chainsMap[chain.id]];

    openInAppBrowser(`${explorerUrl}/tx/${tx.hash}`);
  };

  const modalContainerStyles = useAnimatedStyle(() => ({
    paddingTop: interpolate(openValue.value, [0, 1], [12, 32]),
    height: interpolate(openValue.value, [0, 1], [72, 350]),
  }));

  const iconStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          openValue.value,
          [0, 1],
          // center of the screen for the icon
          [0, MODAL_WIDTH / 2 - ICON_SIZE],
        ),
      },
      {
        scale: interpolate(openValue.value, [0, 1], [1, 1.33]),
      },
    ],
  }));

  const modalIconArrowStyles = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(openValue.value, [0, 1], [1, 1.33]),
      },
    ],
    bottom: interpolate(openValue.value, [0, 1], [2, -3]),
    right: interpolate(openValue.value, [0, 1], [-6, -8]),
  }));

  const modalTitleTextContainerStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(openValue.value, [0, 1], [0, 87]),
      },
      {
        translateX: interpolate(openValue.value, [0, 1], [0, -45]),
      },
    ],
    minWidth: interpolate(openValue.value, [0, 1], [0, MODAL_CONTENT_WIDTH]),
    alignItems: openValue.value ? 'center' : 'flex-start',
  }));

  const modalInfoTextRowStyles = useAnimatedStyle(() => ({
    flexDirection: openValue.value ? 'row' : 'column',
    justifyContent: 'space-between',
    minWidth: interpolate(openValue.value, [0, 1], [0, MODAL_CONTENT_WIDTH]),
    transform: [
      {
        translateY: interpolate(openValue.value, [0, 1], [0, 65]),
      },
    ],
  }));

  const time = getTimeString(tx.time);
  const dateTime = getDateTimeString(tx.time);

  const isPositiveAmount = tx.amount > 0;

  return (
    <Animated.View style={[styles.container, modalContainerStyles]}>
      <View style={styles.content}>
        <Animated.View style={[styles.txIconContainer, iconStyles]}>
          {tx.icon === 'eth' ? (
            <EthereumCircleIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={Colors.ui_purple_90}
            />
          ) : (
            <DollarIcon
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={Colors.ui_green_50}
            />
          )}
          <Animated.View
            style={[
              styles.arrowIconContainer,
              modalIconArrowStyles,

              {transform: [{rotate: isPositiveAmount ? '0deg' : '180deg'}]},
            ]}>
            <FullArrowIcon width={8} height={9} />
          </Animated.View>
        </Animated.View>
        <Animated.View style={[modalTitleTextContainerStyles, {gap: 3}]}>
          <Text style={[styles.titleText]}>{tx.title}</Text>
          <Text style={styles.timeText}>{isOpen ? dateTime : time}</Text>
        </Animated.View>
      </View>
      <View style={{alignSelf: 'center', gap: 12}}>
        <Animated.View style={modalInfoTextRowStyles}>
          {isOpen && (
            <Animated.Text style={styles.subtitle}>Amount</Animated.Text>
          )}
          <Text
            style={[
              styles.amountText,
              {
                color: isPositiveAmount
                  ? Colors.ui_green_50
                  : Colors.ui_grey_70,
              },
            ]}>{`${isPositiveAmount ? '+' : '-'}$${Math.abs(tx.amount)}`}</Text>
        </Animated.View>
        {isOpen && (
          <Animated.View
            style={[{alignSelf: 'center'}, modalInfoTextRowStyles]}>
            <Animated.Text style={styles.subtitle}>From</Animated.Text>

            <Text style={[styles.amountText]}>{shortenAddress(tx.hash)}</Text>
          </Animated.View>
        )}
        {isOpen && (
          <View style={styles.buttonContainer}>
            <Button
              onPress={onOpenTransactionInExplorer}
              text="View on Blockchain"
              type={BUTTON_TYPE.ACTION}
              style={styles.buttonContainer}
              textStyle={styles.buttonText}
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    overflow: 'hidden',
    padding: PADDING,
    flex: 1,
    backgroundColor: Colors.ui_white,
  },
  titleText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_black_80,
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
  },
  amountText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  hashText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_black_80,
  },
  txIconContainer: {
    width: 36,
    height: 36,
  },
  arrowIconContainer: {
    position: 'absolute',
    right: -6,
    bottom: 2,

    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.ui_white,
    backgroundColor: Colors.ui_orange_20,
    borderRadius: 13,
    width: 20,
    height: 20,
  },
  subtitle: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.ui_grey_70,
  },
  content: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  buttonContainer: {
    transform: [
      {
        translateY: 46,
      },
    ],
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
  },
});

import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {BlurView} from '@react-native-community/blur';
import Clipboard from '@react-native-clipboard/clipboard';
import BouncyCheckbox from 'react-native-bouncy-checkbox';

import {Colors, Fonts} from '@/shared/ui';
import {CloseIcon} from '@/shared/ui/icons/CloseIcon';
import {useUserStore} from '@/store/useUserStore';
import {QRWithLogo} from '@/components/QRWithLogo/QRWithLogo';
import {CheckIcon} from '@/shared/ui/icons';
import {Button} from '@/components';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {CopyIcon} from '@/shared/ui/icons/CopyIcon';
import {LockIcon} from '@/shared/ui/icons/LockIcon';

interface Props {
  onClose: () => void;
}

export const ReceiveScreen: React.FC<Props> = ({onClose}) => {
  const [isBlurred, setIsBlurred] = useState<boolean>(true);
  const [isChecked, setIsChecked] = useState<boolean>(false);

  const [isCopied, setIsCopied] = useState(false);

  const blurValue = useSharedValue(0);

  const walletAddress = useUserStore(state => state.walletAddress);

  const onPressCheckBox = () => {
    setIsChecked(prev => !prev);
  };

  const onHideBlur = () => {
    setIsBlurred(false);
    blurValue.value = withTiming(1, {duration: 200});
  };

  const copyAddressToClipboard = () => {
    Clipboard.setString(walletAddress);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const opacityBlurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(blurValue.value, [0, 1], [0.4, 1]),
  }));

  return (
    <Animated.View style={styles.container} entering={FadeIn} exiting={FadeOut}>
      <View style={styles.view}>
        <Pressable style={styles.closeIconContainer} onPress={onClose}>
          <CloseIcon color={Colors.ui_white} />
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.headerText}>Receive</Text>
        </View>
        <Text style={styles.titleText}>Your Rivo’s address</Text>
        <Text style={styles.warningText}>
          Send only USDC on the Arbitrum. Sending other tokens or using other
          networks may result in permanent loss of your funds
        </Text>

        <View style={styles.relativeCenter}>
          <Animated.View style={[styles.blurContainer, opacityBlurStyle]}>
            {isBlurred && (
              <Animated.View
                style={[styles.absolute, {zIndex: 9}]}
                exiting={FadeOut}>
                <BlurView blurType="dark" blurAmount={10} style={styles.blur} />
              </Animated.View>
            )}
            <View style={styles.qrContainer}>
              <QRWithLogo value={walletAddress} />
            </View>
          </Animated.View>
          {isBlurred && (
            <LockIcon style={styles.lockIcon} color={Colors.ui_white} />
          )}
        </View>

        {isBlurred ? (
          <Animated.View exiting={FadeOut}>
            <Pressable
              style={[styles.checkboxContainer]}
              onPress={onPressCheckBox}>
              <BouncyCheckbox
                isChecked={isChecked}
                onPress={onPressCheckBox}
                useBuiltInState={false}
                fillColor={Colors.ui_white}
                iconImageStyle={{tintColor: Colors.ui_black}}
                size={20}
                innerIconStyle={{
                  borderWidth: 2,
                  borderRadius: 5,
                }}
                iconStyle={{
                  borderRadius: 5,
                }}
                disableText
                textStyle={{textDecorationStyle: 'solid'}}
              />
              <Text style={styles.checkboxText}>
                I understand that If I send wrong assets or use wrong network I
                may loose my funds
              </Text>
            </Pressable>
            {isChecked && (
              <Animated.View
                style={styles.buttonContainer}
                entering={FadeIn}
                exiting={FadeOut}>
                <Button
                  type={BUTTON_TYPE.ACTION_DARK}
                  text="Show my USDC address"
                  textStyle={styles.buttonText}
                  onPress={onHideBlur}
                  style={styles.button}
                />
              </Animated.View>
            )}
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.centerContainer}>
            <Button
              type={BUTTON_TYPE.ACTION_DARK}
              text={isCopied ? 'Copied' : 'Copy address'}
              textStyle={styles.buttonText}
              disabledStyle={{opacity: 1}}
              onPress={copyAddressToClipboard}
              disabled={isCopied}
              style={styles.button}>
              {isCopied ? (
                <CheckIcon color={Colors.ui_orange_80} width={18} height={18} />
              ) : (
                <CopyIcon />
              )}
            </Button>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingTop: initialWindowMetrics?.insets.top,
    paddingBottom: initialWindowMetrics?.insets.bottom,
    backgroundColor: Colors.ui_black,

    zIndex: 3,
  },
  view: {
    position: 'relative',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 18,
    left: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: Colors.ui_black_65,
    borderRadius: 18,
    zIndex: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  headerText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_white,
  },
  titleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    color: Colors.ui_white,
    textAlign: 'center',
    marginTop: 19,
    marginBottom: 8,
  },
  warningText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
    letterSpacing: 0.18,

    color: Colors.ui_orange_79,

    maxWidth: 287,
    margin: 'auto',
    textAlign: 'center',
    marginBottom: 8,
  },
  blurContainer: {
    padding: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrContainer: {
    padding: 30,
    backgroundColor: Colors.ui_white,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    maxWidth: 306,
    margin: 'auto',
    gap: 10,
  },
  centerContainer: {
    paddingHorizontal: 35,
  },
  checkboxText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_white,
    lineHeight: 20.3,
  },
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 35,
  },
  button: {
    marginTop: 16,
    borderRadius: 40,
    height: 56,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
  blur: {
    width: '100%',
    height: '100%',
  },
  relativeCenter: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    position: 'absolute',
  },
});

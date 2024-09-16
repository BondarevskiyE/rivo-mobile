import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Animated, {
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {isAddress} from 'viem';
import LinearGradient from 'react-native-linear-gradient';

import {Colors, Fonts} from '@/shared/ui';
import {Button} from '@/components/general';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {ScanIcon} from '@/shared/ui/icons/ScanIcon';
import {shortenAddress} from '@/shared/lib/format';
import {CameraScanner} from '@/components/CameraScanner';

const addressPlaceholder = 'Arbitrum address';

interface Props {
  sendToAddress: string;
  onChangeSendToAddress: (address: string) => void;
  loadingValue: SharedValue<number>;
}

const getInputText = (input: string) => {
  if (!input.length) {
    return addressPlaceholder;
  }

  const isInputAddress = isAddress(input);

  if (isInputAddress) {
    return shortenAddress(input);
  }

  return input;
};

export const PasteAddress: React.FC<Props> = ({
  sendToAddress,
  onChangeSendToAddress,
  loadingValue,
}) => {
  const [isCameraShown, setIsCameraShown] = useState<boolean>(false);

  const handlePasteAddress = async () => {
    const copiedAddress = await Clipboard.getString();
    onChangeSendToAddress(copiedAddress);
  };

  const onOpenCameraScanner = () => {
    setIsCameraShown(true);
  };

  const onCloseCameraScanner = () => {
    setIsCameraShown(false);
  };

  const onReadCode = (code: string) => {
    onChangeSendToAddress(code);
    onCloseCameraScanner();
  };

  const containerStyles = useAnimatedStyle(() => ({
    top: interpolate(loadingValue.value, [0, 1], [0, -35]),
    opacity: interpolate(loadingValue.value, [0, 1], [1, 0]),
  }));

  const text = getInputText(sendToAddress);

  const isLongText = text.length >= 27;

  return (
    <Animated.View style={[styles.container, containerStyles]}>
      {isCameraShown && (
        <CameraScanner
          onReadCode={onReadCode}
          onClose={onCloseCameraScanner}
          title="Scan Arbitrum Address"
        />
      )}
      <View style={styles.textContiner}>
        {isLongText && (
          <LinearGradient
            start={{x: 1, y: 0}}
            end={{x: 0, y: 0}}
            colors={['rgba(25, 25, 25, 0)', 'rgba(25, 25, 25, 1)']}
            style={styles.gradient}
          />
        )}
        <Text
          style={[
            styles.addressText,
            {
              left: isLongText ? -10 : 0,
              color: sendToAddress.length ? Colors.ui_white : Colors.ui_grey_57,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="head">
          {text}
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        <Button
          type={BUTTON_TYPE.ACTION_DARK}
          style={styles.button}
          textStyle={styles.buttonText}
          text="Paste"
          onPress={handlePasteAddress}
        />
        <Button
          type={BUTTON_TYPE.ACTION_DARK}
          style={styles.button}
          textStyle={styles.buttonText}
          text=""
          onPress={onOpenCameraScanner}>
          <ScanIcon width={18} height={18} />
        </Button>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 28,
    backgroundColor: Colors.ui_black_65,
    borderRadius: 20,

    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  button: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 30,
    height: 32,
    backgroundColor: Colors.ui_brown_50,
  },
  buttonText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
  },
  addressText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    height: 20,
    maxWidth: 230,
  },
  textContiner: {
    position: 'relative',
    flex: 1,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 30,
    height: 20,
    zIndex: 10,
  },
});

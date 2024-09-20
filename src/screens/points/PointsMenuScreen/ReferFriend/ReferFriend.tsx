import {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import MaskedView from '@react-native-masked-view/masked-view';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Button} from '@/components';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {Colors, Fonts, Images} from '@/shared/ui';
import {CopyIcon} from '@/shared/ui/icons/CopyIcon';
import {CheckIcon} from '@/shared/ui/icons';

interface Props {
  code: string;
}

export const ReferFriend: React.FC<Props> = ({code}) => {
  const [isCopied, setIsCopied] = useState(false);

  const copiedValue = useSharedValue(0);

  const handleCopyCode = () => {
    if (isCopied) {
      return;
    }
    Clipboard.setString(code);
    copiedValue.value = withTiming(1, {
      duration: 150,
    });

    setIsCopied(true);

    setTimeout(() => {
      copiedValue.value = withTiming(0, {
        duration: 150,
      });
      setIsCopied(false);
    }, 1500);
  };

  const copyIconContainerStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(copiedValue.value, [0, 1], [0, -20]),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      <View style={{gap: 2, marginBottom: 24}}>
        <View style={styles.rowBetween}>
          <Text style={styles.upperText}>Refer a friend</Text>
          <Text style={styles.upperText}>0</Text>
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.lowerText}>8% from their points</Text>
          <Text style={styles.lowerText}>Earned from 0 friends</Text>
        </View>
      </View>
      <View style={styles.rowBetween}>
        <Pressable onPress={handleCopyCode} style={styles.copyContainer}>
          <MaskedView
            style={styles.maskedView}
            maskElement={
              <View style={styles.maskWrapper}>
                <Text style={styles.referFriendCodeText}>{code}</Text>
              </View>
            }>
            <Image source={Images.referFriendMask} style={styles.maskImage} />
          </MaskedView>
          <View style={styles.copyIconContainer}>
            <Animated.View style={copyIconContainerStyles}>
              <CopyIcon color={Colors.ui_grey_65} />
            </Animated.View>
            <Animated.View style={copyIconContainerStyles}>
              <CheckIcon color={Colors.ui_grey_65} />
            </Animated.View>
          </View>
        </Pressable>
        <Button
          text="Share"
          onPress={() => {}}
          type={BUTTON_TYPE.SECONDARY}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.ui_grey_98,
    borderRadius: 24,
  },
  upperText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_white,
  },
  lowerText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_73,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maskedView: {
    flexDirection: 'row',
    height: 26,
  },
  maskImage: {
    width: 87,
  },
  maskWrapper: {
    backgroundColor: 'transparent',
    alignItems: 'flex-start',
  },
  referFriendCodeText: {
    fontFamily: Fonts.medium,
    fontSize: 24,
  },
  button: {
    backgroundColor: Colors.ui_brown_20,
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 30,
    height: 40,
  },
  buttonText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  copyIconContainer: {
    overflow: 'hidden',
    height: 20,
  },
});

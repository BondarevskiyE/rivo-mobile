import {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {Colors, Fonts} from '@/shared/ui';
import {CheckIcon} from '@/shared/ui/icons';
import {useNotificationsStore} from '@/store/useNotificationsStore';

const APressable = Animated.createAnimatedComponent(Pressable);

export const MarkAsReadButton = () => {
  const [isPressed, setIsPressed] = useState(false);

  const markAllAsRead = useNotificationsStore(state => state.markAllAsRead);

  const animationValue = useSharedValue(0);

  const onPress = async () => {
    if (isPressed) {
      return;
    }

    setIsPressed(true);

    animationValue.value = withTiming(1);

    setTimeout(() => {
      setIsPressed(false);

      animationValue.value = withTiming(0, {duration: 150});
    }, 1500);
  };

  const buttonStyles = useAnimatedStyle(() => ({
    width: interpolate(animationValue.value, [0, 1], [167, 86]),
  }));

  const textStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(animationValue.value, [0, 1], [0, -20]),
      },
    ],
  }));

  return (
    <APressable onPress={onPress} style={[styles.container, buttonStyles]}>
      <CheckIcon color={Colors.ui_grey_715} width={17} height={14} />
      <View style={styles.textContainer}>
        <Animated.Text style={[styles.text, textStyles]}>
          Mark all as read
        </Animated.Text>

        <Animated.Text style={[styles.text, textStyles]}>Done!</Animated.Text>
      </View>
    </APressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,

    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 19,
    backgroundColor: Colors.ui_beige_10,

    overflow: 'hidden',
  },
  textContainer: {
    height: 20,
    overflow: 'hidden',
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.ui_grey_715,
  },
});

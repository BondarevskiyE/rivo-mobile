import  {useEffect} from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import {CardShineIcon} from '@/shared/ui/icons';
import ReAnimated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {withChildren} from '@/shared/types';

const SHINE_INTERVAL_TIME = 5000;

interface Props {
  onPress: () => void;
  image: ImageSourcePropType;
  withShine?: boolean;
  style?: StyleProp<ViewStyle>;
}

type PropsWithChildren = Props & withChildren;

export const ImageBadge = ({
  onPress,
  image,
  withShine,
  children,
  style,
}: PropsWithChildren) => {
  const shineGradientValue = useSharedValue(0);

  useEffect(() => {
    if (!withShine) {
      return;
    }
    const interval = setInterval(() => {
      shineGradientValue.value = withSequence(
        withTiming(1, {duration: 1700}),
        withTiming(0, {duration: 0}),
      );
      // shineGradientValue.value = 1;
    }, SHINE_INTERVAL_TIME);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shineGradientStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shineGradientValue.value,
          [0, 1],
          [-230, 500],
          Extrapolation.EXTEND,
        ),
      },
    ],
  }));

  return (
    <Pressable style={[styles.container, style]} onPress={onPress}>
      <ImageBackground source={image} style={styles.backgroundImage}>
        {withShine && (
          <ReAnimated.View
            style={[styles.shineGradientContainer, shineGradientStyles]}>
            <CardShineIcon />
          </ReAnimated.View>
        )}
        <View style={styles.children}>{children}</View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  children: {
    paddingHorizontal: 16,
    paddingVertical: 18,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'center',
  },
  backgroundImage: {
    position: 'relative',
  },
  shineGradientContainer: {
    position: 'absolute',
    top: -40,
    left: -230,
    width: 40,
    height: '100%',
    zIndex: 3,
  },
});

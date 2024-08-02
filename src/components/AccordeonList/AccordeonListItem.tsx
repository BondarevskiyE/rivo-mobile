import {Colors} from '@/shared/ui';
import {ArrowLineIcon} from '@/shared/ui/icons';
import React, {useEffect} from 'react';
import {
  Image,
  ImageURISource,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReAnimated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  image: ImageURISource;
  title: string;
  content: JSX.Element;
  openItem: (id: string | null) => void;
  openId: string | null;
  id: string;
}

export const AccordeonListItem: React.FC<Props> = ({
  image,
  title,
  openId,
  id,
  openItem,
  content,
}) => {
  const height = useSharedValue(0);
  const openValue = useSharedValue(0);

  const derivedHeight = useDerivedValue(() => height.value * openValue.value);

  useEffect(() => {
    if (openId === id) {
      openValue.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.linear),
      });
      return;
    }
    openValue.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.linear),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const contentStyles = useAnimatedStyle(() => ({
    height: derivedHeight.value,
  }));

  const arrowStyles = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(openValue.value, [0, 1], [90, 270])}deg`,
      },
    ],
  }));

  const handleTouch = () => {
    if (openId === id) {
      openItem(null);
      return;
    }
    openItem(id);
  };

  return (
    <Pressable onPress={handleTouch} style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.titleBlock}>
          <Image source={image} />
          <Text>{title}</Text>
        </View>
        <ReAnimated.View style={arrowStyles}>
          <ArrowLineIcon color={Colors.ui_grey_70} height={13} width={12} />
        </ReAnimated.View>
      </View>

      <ReAnimated.View style={[styles.animatedContainer, contentStyles]}>
        <View
          style={styles.wrapper}
          onLayout={e => {
            height.value = e.nativeEvent.layout.height;
          }}>
          {content}
        </View>
      </ReAnimated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  animatedContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  wrapper: {
    marginTop: 16,
    width: '100%',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
  },
});

import {Colors, Fonts} from '@/shared/ui';
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
  AdditionalTitleComponent: React.ReactNode;
  openItem: (id: string | null) => void;
  openId: string | null;
  id: string;
  isLastItem: boolean;
}

export const AccordeonListItem: React.FC<Props> = ({
  image,
  title,
  openId,
  id,
  openItem,
  content,
  AdditionalTitleComponent,
  isLastItem,
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
    <Pressable
      onPress={handleTouch}
      style={[styles.container, {paddingBottom: isLastItem ? 22 : 0}]}>
      <View style={styles.titleContainer}>
        <View style={styles.titleBlock}>
          <Image source={image} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.arrowContainer}>
          {AdditionalTitleComponent}
          <View>
            <ReAnimated.View style={arrowStyles}>
              <ArrowLineIcon color={Colors.ui_grey_70} height={13} width={12} />
            </ReAnimated.View>
          </View>
        </View>
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
      {!isLastItem && <View style={styles.dividerLine} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 22,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  animatedContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  wrapper: {
    marginTop: 16,
    paddingHorizontal: 16,
    width: '100%',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
  },
  dividerLine: {
    width: '100%',
    height: 0.5,
    marginTop: 22,
    backgroundColor: Colors.ui_grey_13,
  },
  title: {
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
});

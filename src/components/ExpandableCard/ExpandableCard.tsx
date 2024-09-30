import React, {
  useState,
  useRef,
  JSXElementConstructor,
  ReactElement,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Modal,
  StyleProp,
  ViewStyle,
  Pressable,
} from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import {Colors} from '@/shared/ui';
import {CloseIcon} from '@/shared/ui/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CardSize = {
  width: number;
  height: number;
  borderRadius: number;
};

interface Props {
  children: ReactElement<any, string | JSXElementConstructor<any>>;
  onPress?: (isOpen: boolean) => void;
  initialSize?: CardSize;
  expandedSize?: CardSize;
  containerStyles?: StyleProp<ViewStyle>;
  disableExpandAnimation?: boolean;
  duplicateCardWhenExpand?: boolean;
  expandTime?: number;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const DEFAULT_EXPAND_TIME = 250;

const paddingHorizontal = 12;
const paddingBottom = 20;

const defaultSize = {
  width: 170,
  height: 232,
  borderRadius: 24,
};

const defaultExpandedSize = {
  width: SCREEN_WIDTH - paddingHorizontal * 2,
  height: 677,
  borderRadius: 32,
};

export const ExpandableCard: React.FC<Props> = ({
  onPress,
  children,
  initialSize = defaultSize,
  expandedSize = defaultExpandedSize,
  containerStyles,
  disableExpandAnimation = false,
  duplicateCardWhenExpand = false,
  expandTime = DEFAULT_EXPAND_TIME,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const cardWidth = useSharedValue(initialSize.width);
  const cardHeight = useSharedValue(initialSize.height);
  const cardBorderRadius = useSharedValue(initialSize.borderRadius);
  const cardTop = useSharedValue(0);
  const cardLeft = useSharedValue(0);

  const modalOpacity = useSharedValue(0);

  const containerRef = useRef<View>(null);

  const handlePress = () => {
    containerRef.current?.measureInWindow((x, y) => {
      if (isOpen) {
        // Animate to initial size and position
        cardWidth.value = withTiming(initialSize.width, {
          duration: expandTime,
          easing: Easing.inOut(Easing.ease),
        });

        cardHeight.value = withTiming(initialSize.height, {
          duration: expandTime,
          easing: Easing.inOut(Easing.ease),
        });

        cardBorderRadius.value = withTiming(initialSize.borderRadius, {
          duration: expandTime,
          easing: Easing.inOut(Easing.ease),
        });

        cardTop.value = withTiming(0, {
          duration: expandTime,
          easing: Easing.inOut(Easing.ease),
        });

        cardLeft.value = withTiming(0, {
          duration: expandTime,
          easing: Easing.inOut(Easing.ease),
        });
      } else {
        // Animate to full screen size and position
        cardWidth.value = withTiming(expandedSize.width, {
          duration: expandTime,
          easing: Easing.inOut(Easing.ease),
        });

        cardHeight.value = withTiming(expandedSize.height, {
          duration: expandTime,
          easing: Easing.inOut(Easing.ease),
        });

        cardBorderRadius.value = withTiming(expandedSize.borderRadius, {
          duration: expandTime,
          easing: Easing.inOut(Easing.ease),
        });

        cardTop.value = withTiming(
          SCREEN_HEIGHT - y - expandedSize.height - paddingBottom,
          {
            duration: expandTime,
            easing: Easing.inOut(Easing.ease),
          },
        );

        cardLeft.value = withTiming(
          SCREEN_WIDTH - x - expandedSize.width - paddingHorizontal,
          {
            duration: expandTime,
            easing: Easing.inOut(Easing.ease),
          },
        );
      }

      setIsOpen(!isOpen);
      onPress?.(isOpen);

      if (disableExpandAnimation) {
        modalOpacity.value = withTiming(isOpen ? 0 : 1, {duration: 300});
        return;
      }

      setTimeout(() => {
        modalOpacity.value = withTiming(isOpen ? 0 : 1, {duration: 300});
      }, expandTime - 100);
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: cardWidth.value,
      height: cardHeight.value,
      borderRadius: cardBorderRadius.value,
      top: cardTop.value,
      left: cardLeft.value,
    };
  });

  const containerStyle = useAnimatedStyle(() => ({
    zIndex: cardHeight.value,
  }));

  const modalOpacityStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
  }));

  const renderChildren = useCallback(() => {
    return React.cloneElement(children, {
      isOpen,
      animationTime: expandTime,
    });
  }, [children, isOpen]);

  return (
    <Animated.View
      style={[
        styles.container,
        {width: initialSize.width, height: initialSize.height},
        containerStyle,
      ]}
      ref={containerRef}>
      <Pressable onPress={handlePress}>
        <>
          <Animated.View
            style={[
              styles.card,
              disableExpandAnimation ? initialSize : animatedStyle,
              containerStyle,
            ]}>
            {/* render children element. If disableExpandAnimation is true we don't pass isOpen prop */}
            {disableExpandAnimation ? children : renderChildren()}
          </Animated.View>
          {duplicateCardWhenExpand && (
            // render duplicate that will be displayed on the same place when animation starts
            <View style={[styles.card, initialSize]}>{children}</View>
          )}
        </>
      </Pressable>

      {/* show modal above all to disable scroll and show dark overlay */}
      {isOpen && (
        <Modal
          transparent
          animationType={disableExpandAnimation ? 'slide' : 'none'}
          visible={isOpen}
          onRequestClose={handlePress}>
          <AnimatedPressable
            style={[styles.modalOverlay, modalOpacityStyle]}
            onPress={handlePress}
          />
          <Animated.View
            style={[
              styles.card,
              containerStyles,
              {
                width: expandedSize.width,
                height: expandedSize.height,
                borderRadius: expandedSize.borderRadius,
                top: SCREEN_HEIGHT - expandedSize.height - paddingBottom,
                left: SCREEN_WIDTH - expandedSize.width - paddingHorizontal,
              },
              modalOpacityStyle,
            ]}>
            <Pressable style={styles.closeIconContainer} onPress={handlePress}>
              <CloseIcon color={Colors.ui_grey_73} />
            </Pressable>
            {renderChildren()}
          </Animated.View>
        </Modal>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  card: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 10,
  },
  cardText: {
    fontSize: 18,
    color: 'white',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: Colors.ui_grey_02,
    borderRadius: 18,
    zIndex: 2,
  },
});

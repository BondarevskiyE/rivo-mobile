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
  TouchableWithoutFeedback,
  Modal,
  LayoutChangeEvent,
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

interface Props {
  onPress: (isOpen: boolean) => void;
  children: ReactElement<any, string | JSXElementConstructor<any>>;
  containerStyles?: StyleProp<ViewStyle>;
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const EXPAND_TIME = 250;
const initialCardWidth = 170;
const initialCardHeight = 232;
const expandedCardHeight = 677;
const paddingHorizontal = 12;
const paddingBottom = 20;
const expandedCardWidth = SCREEN_WIDTH - paddingHorizontal * 2;

export const ExpandableCard: React.FC<Props> = ({
  onPress,
  children,
  containerStyles,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cardPosition, setCardPosition] = useState({x: 0, y: 0});

  const cardWidth = useSharedValue(initialCardWidth);
  const cardHeight = useSharedValue(initialCardHeight);
  const cardBorderRadius = useSharedValue(24);
  const cardTop = useSharedValue(0);
  const cardLeft = useSharedValue(0);

  const cardTopModal = useSharedValue(cardPosition.x);
  const cardLeftModal = useSharedValue(cardPosition.y);

  const modalOpacity = useSharedValue(0);

  const containerRef = useRef<View>(null);

  const handlePress = () => {
    containerRef.current?.measureInWindow((x, y) => {
      if (isOpen) {
        // Animate to initial size and position
        cardWidth.value = withTiming(initialCardWidth, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });

        cardHeight.value = withTiming(initialCardHeight, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });

        cardBorderRadius.value = withTiming(24, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });

        cardTop.value = withTiming(0, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });

        cardTopModal.value = withTiming(x, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });

        cardLeft.value = withTiming(0, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });

        cardLeftModal.value = withTiming(y, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });
      } else {
        // Animate to full screen size and position
        cardWidth.value = withTiming(SCREEN_WIDTH - 2 * paddingHorizontal, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });

        cardHeight.value = withTiming(expandedCardHeight, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });

        cardBorderRadius.value = withTiming(32, {
          duration: EXPAND_TIME,
          easing: Easing.inOut(Easing.ease),
        });

        cardTop.value = withTiming(
          SCREEN_HEIGHT - y - expandedCardHeight - paddingBottom,
          {
            duration: EXPAND_TIME,
            easing: Easing.inOut(Easing.ease),
          },
        );

        cardTopModal.value = withTiming(
          SCREEN_HEIGHT - expandedCardHeight - paddingBottom,
          {
            duration: EXPAND_TIME,
            easing: Easing.inOut(Easing.ease),
          },
        );

        cardLeft.value = withTiming(
          SCREEN_WIDTH - x - expandedCardWidth - paddingHorizontal,
          {
            duration: EXPAND_TIME,
            easing: Easing.inOut(Easing.ease),
          },
        );

        cardLeftModal.value = withTiming(
          SCREEN_WIDTH - expandedCardWidth - paddingHorizontal,
          {
            duration: EXPAND_TIME,
            easing: Easing.inOut(Easing.ease),
          },
        );
      }

      setIsOpen(!isOpen);
      onPress(isOpen);

      setTimeout(() => {
        modalOpacity.value = withTiming(isOpen ? 0 : 1, {duration: 300});
      }, EXPAND_TIME - 100);
    });
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const x = e.nativeEvent.layout.x;
    const y = e.nativeEvent.layout.y;

    setCardPosition({x, y});
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

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      width: cardWidth.value,
      height: cardHeight.value,
      borderRadius: cardBorderRadius.value,
      top: cardTopModal.value,
      left: cardLeftModal.value,
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
    });
  }, [children, isOpen]);

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      ref={containerRef}
      onLayout={onLayout}>
      <TouchableWithoutFeedback onPress={handlePress}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {renderChildren()}
        </Animated.View>
      </TouchableWithoutFeedback>

      {isOpen && (
        <Modal
          transparent
          animationType="none"
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
              animatedModalStyle,
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
    height: initialCardHeight,
    width: initialCardWidth,
    flex: 1,
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

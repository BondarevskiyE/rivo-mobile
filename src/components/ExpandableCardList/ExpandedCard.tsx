import React, {useEffect, useRef} from 'react';
import {Animated, Dimensions, TouchableWithoutFeedback} from 'react-native';

const ELEMENT_HEIGHT = 200;

const {width: windowWidth} = Dimensions.get('window');

interface Props {
  unselectCard: () => void;
  xOffset: number;
  yOffset: number;
}

export const ExpandedCard: React.FC<Props> = ({
  unselectCard,
  xOffset,
  yOffset,
}) => {
  const value = useRef(new Animated.Value(0)).current;

  const handleUnselectCard = () => {
    Animated.timing(value, {
      toValue: 0,
      useNativeDriver: false,
      duration: 500,
    }).start(() => unselectCard());
  };

  const getTranslate = (outputRange: [number, number]) => {
    return value.interpolate({
      inputRange: [0, 1],
      outputRange,
    });
  };

  const topTranslate = getTranslate([yOffset, 0]);
  const leftTranslate = getTranslate([xOffset, 0]);
  const rightTranslate = getTranslate([xOffset, 0]);
  const bottomTranslate = getTranslate([
    windowWidth - xOffset - ELEMENT_HEIGHT,
    0,
  ]);

  useEffect(() => {
    Animated.timing(value, {
      toValue: 1,
      useNativeDriver: false,
      duration: 500,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: topTranslate,
          left: leftTranslate,
          right: rightTranslate,
          bottom: bottomTranslate,
          backgroundColor: '#5cdb95',
        },
      ]}>
      <TouchableWithoutFeedback onPress={handleUnselectCard}>
        <Animated.Text
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 200,
            opacity: getTranslate([0, 1]),
          }}>
          X
        </Animated.Text>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

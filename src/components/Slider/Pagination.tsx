import {StyleSheet, Animated, View, Dimensions} from 'react-native';

import {CardItem} from './types';

interface Props {
  data: CardItem[];
  scrollX: Animated.Value;
}

const {width} = Dimensions.get('screen');

export const Pagination = ({data, scrollX}: Props) => {
  return (
    <View style={styles.container}>
      {data.map((_, idx) => {
        const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];

        const backgroundColor = scrollX.interpolate({
          inputRange,
          outputRange: ['transparent', '#535353', 'transparent'],
          extrapolate: 'clamp',
        });

        const borderColor = scrollX.interpolate({
          inputRange,
          outputRange: ['#bebebe', '#535353', '#bebebe'],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={idx.toString()}
            style={[styles.dot, {backgroundColor, borderColor}]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -15,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 3,
    borderWidth: 2,
  },
  dotActive: {
    backgroundColor: '#000',
  },
});

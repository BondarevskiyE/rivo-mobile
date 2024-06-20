import React, {useRef} from 'react';
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  // ViewToken,
} from 'react-native';
import {CardItem} from './types';
import {SlideItem} from './SlideItem';
import {Pagination} from './Pagination';

interface Props {
  data: CardItem[];
}

export const Slider: React.FC<Props> = ({data}) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  // const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const sliderRef = useRef(null);

  const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              x: scrollX,
            },
          },
        },
      ],
      {
        useNativeDriver: false,
      },
    )(event);
  };

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // useEffect(() => {
  //   setTimeout(() => {
  //     const newSlideIndex = currentSlideIndex + 1;

  //     if (sliderRef.current && newSlideIndex <= data.length - 1) {
  //       setCurrentSlideIndex(newSlideIndex);
  //       // @ts-ignore
  //       sliderRef.current.scrollToIndex({index: newSlideIndex});
  //     }
  //   }, 4000);
  // }, [currentSlideIndex, data]);

  // const handleOnViewableItemsChanged = useRef(
  //   ({viewableItems}: {viewableItems: ViewToken<CardItem>[]}) => {
  //     setCurrentSlideIndex(viewableItems[0].index || 0);
  //   },
  // ).current;

  return (
    <View style={{flex: 0.95}}>
      <FlatList
        data={data}
        renderItem={({item, index}) => (
          <SlideItem item={item} scrollX={scrollX} index={index} />
        )}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onScroll={handleOnScroll}
        viewabilityConfig={viewabilityConfig}
        // onViewableItemsChanged={handleOnViewableItemsChanged}
        ref={sliderRef}
      />
      <Pagination data={data} scrollX={scrollX} />
    </View>
  );
};

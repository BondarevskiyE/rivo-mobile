import React, {useRef, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View, ViewToken} from 'react-native';

import {InfoCarouselItem} from './InfoCarouselItem';
import {ChartCarouselItem} from './ChartCarouselItem/ChartCarouselItem';
import {CloseIcon} from '@/shared/ui/icons';
import {Colors} from '@/shared/ui';
import {Pagination} from './Pagination/Pagination';
import {Strategy} from '@/shared/types';
import {Page, PAGES} from './types';
import ReAnimated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

interface Props {
  vault: Strategy;
  goBack: () => void;
}

const pages: Page[] = [
  {
    id: PAGES.INFO,
  },
  {
    id: PAGES.CHART,
  },
];

export const VaultVerticalCarousel: React.FC<Props> = ({vault, goBack}) => {
  const scrollY = useSharedValue(0);
  const carouselRef = useRef<FlatList>(null);

  const [currentSlideId, setCurrentSlideId] = useState<PAGES>(PAGES.INFO);

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const handleOnViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken<Page>[]}) => {
      setCurrentSlideId(viewableItems?.[0]?.item?.id);
    },
  ).current;

  const goToChartSlide = () => {
    // only if we are on the first slide
    if (currentSlideId === PAGES.INFO) {
      carouselRef?.current?.scrollToEnd();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <Pressable style={styles.closeIconContainer} onPress={goBack}>
          <CloseIcon />
        </Pressable>
        <Pagination scrollY={scrollY} data={pages} />
        <ReAnimated.FlatList
          data={pages}
          style={styles.list}
          overScrollMode="never"
          directionalLockEnabled
          bounces={false}
          renderItem={({item}) => {
            if (item.id === PAGES.INFO) {
              return <InfoCarouselItem vault={vault} />;
            }
            return (
              <ChartCarouselItem
                focusChartSlide={goToChartSlide}
                scrollY={scrollY}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          keyExtractor={(_, index) => index.toString()}
          pagingEnabled
          scrollEventThrottle={16}
          onViewableItemsChanged={handleOnViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 95,
          }}
          ref={carouselRef}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
  },
  listContainer: {
    position: 'relative',
    flex: 0.5,
  },
  list: {
    overflow: 'visible',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: Colors.ui_black_60,
    borderRadius: 18,
    zIndex: 2,
  },
});

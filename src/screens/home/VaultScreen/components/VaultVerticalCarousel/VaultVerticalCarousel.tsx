import React, {useRef, useState} from 'react';
import {FlatList, Pressable, StyleSheet, View, ViewToken} from 'react-native';
import ReAnimated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {InfoCarouselItem} from './InfoCarouselItem';
import {ChartCarouselItem} from './ChartCarouselItem/ChartCarouselItem';
import {CloseIcon} from '@/shared/ui/icons';
import {Colors} from '@/shared/ui';
import {Pagination} from './Pagination/Pagination';
import {Vault} from '@/shared/types';
import {Page, PAGES} from './types';
import {
  CHART_CAROUSEL_BLOCK_HEIGHT,
  INFO_CAROUSEL_BLOCK_HEIGHT,
} from '../constant';

interface Props {
  vault: Vault;
  goBack: () => void;
  isBigCarouselContainer: boolean;
  changeDragBlockSize: (isBig: boolean) => void;
}

const pages: Page[] = [
  {
    id: PAGES.INFO,
  },
  {
    id: PAGES.CHART,
  },
];

export const VaultVerticalCarousel: React.FC<Props> = ({
  vault,
  goBack,
  isBigCarouselContainer,
  changeDragBlockSize,
}) => {
  const scrollY = useSharedValue(0);
  const carouselRef = useRef<FlatList>(null);

  const [currentSlideId, setCurrentSlideId] = useState<PAGES>(PAGES.INFO);

  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const handleOnViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken<Page>[]}) => {
      if (viewableItems?.[0]) {
        setCurrentSlideId(viewableItems?.[0]?.item?.id);
      }
    },
  ).current;

  const goToChartSlide = () => {
    carouselRef?.current?.scrollToEnd();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.listContainer,
          {
            height: isBigCarouselContainer
              ? CHART_CAROUSEL_BLOCK_HEIGHT
              : INFO_CAROUSEL_BLOCK_HEIGHT,
          },
        ]}>
        <Pressable style={styles.closeIconContainer} onPress={goBack}>
          <CloseIcon />
        </Pressable>
        <Pagination scrollY={scrollY} data={pages} />
        <ReAnimated.FlatList
          initialNumToRender={2}
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
                isChartOpen={currentSlideId === PAGES.CHART}
                scrollY={scrollY}
                vault={vault}
                changeDragBlockSize={changeDragBlockSize}
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

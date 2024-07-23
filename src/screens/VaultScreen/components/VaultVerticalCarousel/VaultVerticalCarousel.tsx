import React, {useRef} from 'react';
import {
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import * as RootNavigation from '@/navigation/RootNavigation';
import {InfoCarouselItem} from './InfoCarouselItem';
import {ChartCarouselItem} from './ChartCarouselItem';
import {CloseIcon} from '@/shared/ui/icons';
import {Colors} from '@/shared/ui';
import {HOME_SCREENS} from '@/navigation/HomeStack';
import {Pagination} from './Pagination';
import {Strategy} from '@/shared/types';

interface Props {
  vault: Strategy;
}

const pages = [
  {
    id: 'info',
  },
  {
    id: 'chart',
  },
];

export const VaultVerticalCarousel: React.FC<Props> = ({vault}) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    Animated.event(
      [
        {
          nativeEvent: {
            contentOffset: {
              y: scrollY,
            },
          },
        },
      ],
      {
        useNativeDriver: false,
      },
    )(event);
  };

  const closeVaultScreen = () =>
    RootNavigation.navigate(HOME_SCREENS.HOME_SCREEN);

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <Pressable style={styles.closeIconContainer} onPress={closeVaultScreen}>
          <CloseIcon />
        </Pressable>
        <Pagination scrollY={scrollY} data={pages} />
        <FlatList
          data={pages}
          style={styles.list}
          overScrollMode="never"
          directionalLockEnabled
          bounces={false}
          renderItem={({item}) => {
            if (item.id === 'info') {
              return <InfoCarouselItem vault={vault} />;
            }
            return <ChartCarouselItem />;
          }}
          showsVerticalScrollIndicator={false}
          onScroll={handleOnScroll}
          keyExtractor={(_, index) => index.toString()}
          pagingEnabled
          scrollEventThrottle={16}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 95,
          }}
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

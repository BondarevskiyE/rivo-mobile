import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ImageBackground,
  Text,
  Pressable,
} from 'react-native';
import ReAnimated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

import * as RootNavigation from '@/navigation/RootNavigation';
import {DEFAULT_USER_PHOTO} from '@/shared/constants';
import {useUserStore} from '@/store/useUserStore';
import {PointsCounter} from '@/components/PointsCounter';
import {Colors, Fonts, Images} from '@/shared/ui';
import {useBalanceStore} from '@/store/useBalanceStore';
import {HIGHLIGHT_ELEMENTS} from '@/store/useOnboardingStore';
import {HighlightableElement} from 'react-native-highlight-overlay';
import {formatValue} from '@/shared/lib';
import {ROOT_STACKS} from '@/navigation/types/rootStack';

interface Props {
  cardAnimationValue: SharedValue<number>;
}

const {width} = Dimensions.get('window');

export const Header: React.FC<Props> = ({cardAnimationValue}) => {
  const userBalance = useBalanceStore(state => state.userBalance);

  const user = useUserStore(state => state.userInfo);

  const cardAnimationStyles = useAnimatedStyle(() => ({
    opacity: interpolate(
      cardAnimationValue.value,
      [1, 0],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          cardAnimationValue.value,
          [1, 0],
          [75, 0],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          cardAnimationValue.value,
          [1, 0],
          [2.3, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const handleGoToProfileMenu = () => {
    RootNavigation.navigate(ROOT_STACKS.PROFILE_STACK);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleGoToProfileMenu}>
        <Image
          source={{uri: user?.photo || DEFAULT_USER_PHOTO}}
          style={styles.photo}
        />
      </Pressable>
      <ReAnimated.View style={[styles.card, cardAnimationStyles]}>
        <ImageBackground
          style={styles.cardImage}
          source={Images.userCard}
          resizeMode="contain">
          <View style={styles.balanceContainer}>
            <Text style={styles.dollar}>$</Text>
            <Text
              style={[styles.balance]}
              // TODO think about fontSize here
            >
              {formatValue(userBalance)}
            </Text>
          </View>
        </ImageBackground>
      </ReAnimated.View>
      <HighlightableElement
        id={HIGHLIGHT_ELEMENTS.POINTS}
        options={{
          mode: 'rectangle',
          borderRadius: 16,
          clickthroughHighlight: false,
        }}>
        <PointsCounter />
      </HighlightableElement>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width,
    paddingTop: 7,
    paddingBottom: 7,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
    backgroundColor: Colors.transparent,
    borderStartColor: Colors.ui_beige_30,
  },
  card: {
    position: 'absolute',
    left: width / 2 - 26,
    bottom: 7,
    width: 52,
    height: 32,
    transformOrigin: 'bottom',
  },
  cardImage: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  photo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  dollar: {
    fontFamily: Fonts.medium,
    color: Colors.ui_orange_40,
    fontSize: 12,
    lineHeight: 13.2,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 4,
  },
  balance: {
    fontFamily: Fonts.medium,
    color: Colors.ui_orange_45,
    fontSize: 12,
    lineHeight: 13.2,
  },
});

import {DEFAULT_USER_PHOTO} from '@/shared/constants';
import {useUserStore} from '@/store/useUserStore';
import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ImageBackground,
  Text,
} from 'react-native';
import {PointsCounter} from '@/components/PointsCounter';
import {Colors, Fonts, Images} from '@/shared/ui';
import ReAnimated, {
  Extrapolation,
  SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {useBalanceStore} from '@/store/useBalanceStore';

interface Props {
  cardAnimationValue: SharedValue<number>;
}

const {width} = Dimensions.get('window');

export const Header: React.FC<Props> = ({cardAnimationValue}) => {
  const userBalance = useBalanceStore(state => state.userBalance);

  const user = useUserStore(state => state.userInfo);

  const cardAnimationStyles = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          cardAnimationValue.value,
          [1, 0],
          [100, 0],
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

  return (
    <View style={styles.container}>
      <Image
        source={{uri: user?.photo || DEFAULT_USER_PHOTO}}
        style={styles.photo}
      />
      <ReAnimated.View style={[styles.card, cardAnimationStyles]}>
        <ImageBackground
          style={styles.cardImage}
          source={Images.userCard}
          resizeMode="contain">
          <View style={styles.balanceContainer}>
            <Text style={styles.dollar}>$</Text>
            <Text style={styles.balance}>{userBalance}</Text>
          </View>
        </ImageBackground>
      </ReAnimated.View>
      <PointsCounter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    paddingTop: 7,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
    borderStartColor: Colors.ui_beige_30,
    overflow: 'hidden',
  },
  card: {
    position: 'absolute',
    left: width / 2 - 26,
    top: 0,
    width: 52,
    height: 32,
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

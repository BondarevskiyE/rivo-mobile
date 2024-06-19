import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Button,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {RandomReveal} from 'react-random-reveal';
import {Colors, Fonts, Images} from '../../shared/constants';
import {defaultAddress, randomRevealCharachtersSet} from './constant';

interface Props {
  isLoading?: boolean;
  address?: string;
}

const animate_state = {
  start: 0,
  end: 10,
};

export const CardCreating = ({address = defaultAddress}: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const cardScaleAnimation = useRef(
    new Animated.Value(animate_state.start),
  ).current;
  const colorFillingAnimation = useRef(
    new Animated.Value(animate_state.start),
  ).current;

  useEffect(() => {
    if (!isLoading) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(cardScaleAnimation, {
            toValue: animate_state.end,
            useNativeDriver: false,
            duration: 500,
          }),
          Animated.timing(colorFillingAnimation, {
            toValue: animate_state.end,
            useNativeDriver: false,
            duration: 900,
          }),
        ]),
        Animated.parallel([
          Animated.timing(cardScaleAnimation, {
            toValue: animate_state.start,
            useNativeDriver: false,
            duration: 500,
            delay: 500,
          }),
        ]),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const inputRange = [animate_state.start, animate_state.end];

  const cardScale = cardScaleAnimation.interpolate({
    inputRange: [animate_state.start, animate_state.end],
    outputRange: [1, 1.03],
  });

  const colorCircleScale = colorFillingAnimation.interpolate({
    inputRange,
    outputRange: [0, 100],
  });

  const textColor = colorFillingAnimation.interpolate({
    inputRange,
    outputRange: [Colors.ui_orange_05, '#DB8128'],
  });

  const cardBorderColor = colorFillingAnimation.interpolate({
    inputRange,
    outputRange: [Colors.ui_grey_20, '#eda96b'],
  });

  const titleText = isLoading
    ? 'Creating your wallet...'
    : 'Your wallet is ready!';

  return (
    <View style={styles.container}>
      <Button onPress={() => setIsLoading(prev => !prev)} title="click)" />
      <Animated.View
        style={[
          styles.cardContainer,
          {transform: [{scale: cardScale}], borderColor: cardBorderColor},
        ]}>
        <ImageBackground
          source={Images.cardCat}
          resizeMode="cover"
          style={styles.image}>
          <View style={styles.card}>
            <View style={styles.upperBlock}>
              <Animated.Text style={[styles.rivoText, {color: textColor}]}>
                Rivo
              </Animated.Text>

              <Image source={Images.rivoShadowLogo} style={styles.logoImage} />
            </View>
            <Animated.View
              style={[
                styles.colorCircleContainer,
                {transform: [{scale: colorCircleScale}]},
              ]}>
              <LinearGradient
                start={{x: -2.17073, y: 201}}
                end={{x: 342.063, y: -52.3925}}
                locations={[0.0, 0.99]}
                colors={['#f77c0a', '#ff7f00']}
                style={styles.colorCircleGradient}
              />
            </Animated.View>
            <View style={styles.lowerBlock}>
              <Animated.Text style={[styles.addressText, {color: textColor}]}>
                0x
              </Animated.Text>
              <Animated.Text style={[styles.addressText, {color: textColor}]}>
                {/**@ts-ignore */}
                <RandomReveal
                  isPlaying={isLoading}
                  characters={address.slice(2, 6)}
                  characterSet={randomRevealCharachtersSet}
                />
              </Animated.Text>
              <Animated.Text style={[styles.addressText, {color: textColor}]}>
                ...
              </Animated.Text>
              <Animated.Text style={[styles.addressText, {color: textColor}]}>
                {/**@ts-ignore */}
                <RandomReveal
                  isPlaying={isLoading}
                  characters={address.slice(-5)}
                  characterSet={randomRevealCharachtersSet}
                />
              </Animated.Text>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
      <Text style={styles.title}>{titleText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '40%',
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: Colors.ui_background,
  },
  cardContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
    borderWidth: 0.7,
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingTop: 18,
    paddingLeft: 14,
    paddingBottom: 17,
    paddingRight: 24,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.ui_black,
    marginTop: 20,
    textAlign: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  upperBlock: {
    zIndex: 1000,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  lowerBlock: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
  },
  rivoText: {
    fontFamily: Fonts.bold,
    fontSize: 16.75,
  },
  logoImage: {
    width: 31.4,
    height: 28.6,
  },
  addressText: {
    fontFamily: Fonts.bold,
    fontSize: 22.33,
  },
  colorCircleContainer: {
    position: 'absolute',
    width: 10,
    height: 10,
    left: '50%',
    top: '50%',
  },
  colorCircleGradient: {
    borderRadius: 300,
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
});

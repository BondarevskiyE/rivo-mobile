import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ReAnimated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {useRandomReveal} from 'react-random-reveal';
import {Colors, Fonts, Images} from '@/shared/ui';
import {defaultAddress, randomRevealCharachtersSet} from './constant';
import {Button} from '@/shared/ui/components';
import {Tooltip} from '@/shared/ui/components/Tooltip';
import {ConfettiAnimation} from '@/shared/ui/lottie';
import {useUserStore} from '@/store/useUserStore';
import {LOGIN_STEPS, useLoginStore} from '@/store/useLoginStore';
import {CardShineIcon} from '@/shared/ui/icons';

const tooltipText =
  'Did you know? Rivo is non-custodial wallet, meaning that no-one has access to your funds';

const animate_state = {
  start: 0,
  end: 10,
};

export const CardCreating = () => {
  const isLoading = useLoginStore(state => state.isLoading);
  const setLoginStep = useLoginStore(state => state.setLoginStep);

  const walletAddress = useUserStore(state => state.walletAddress);

  const characters = useRandomReveal({
    isPlaying: isLoading && !walletAddress,
    duration: 100,
    characterSet: randomRevealCharachtersSet,
    characters: defaultAddress,
  });

  const address = walletAddress || characters;

  const cardScaleAnimation = useRef(
    new Animated.Value(animate_state.start),
  ).current;

  const tooltipScaleAnimation = useSharedValue(0);

  const colorFillingAnimation = useRef(
    new Animated.Value(animate_state.start),
  ).current;

  const orangeImageOpacityAnimation = useRef(
    new Animated.Value(animate_state.start),
  ).current;

  const shineAnimation = useRef(
    new Animated.Value(animate_state.start),
  ).current;

  useEffect(() => {
    if (!isLoading) {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(cardScaleAnimation, {
            toValue: animate_state.end,
            useNativeDriver: false,
            duration: 900,
          }),
          Animated.timing(colorFillingAnimation, {
            toValue: animate_state.end,
            useNativeDriver: false,
            duration: 900,
          }),
          Animated.timing(orangeImageOpacityAnimation, {
            toValue: animate_state.end,
            useNativeDriver: false,
            duration: 600,
            delay: 300,
          }),
        ]),
        Animated.parallel([
          Animated.timing(cardScaleAnimation, {
            toValue: animate_state.start,
            useNativeDriver: false,
            duration: 900,
            delay: 500,
          }),
          Animated.timing(shineAnimation, {
            toValue: animate_state.end,
            useNativeDriver: true,
            duration: 900,
            delay: 500,
          }),
        ]),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    tooltipScaleAnimation.value = withDelay(
      1500,
      withTiming(1, {duration: 200}),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputRange = [animate_state.start, animate_state.end];

  const cardScale = cardScaleAnimation.interpolate({
    inputRange,
    outputRange: [1, 1.03],
  });

  const colorCircleScale = colorFillingAnimation.interpolate({
    inputRange,
    outputRange: [0, 50],
  });

  const colorCircleOpacity = colorFillingAnimation.interpolate({
    inputRange,
    outputRange: [1, 0],
  });

  const orangeImageOpacity = orangeImageOpacityAnimation.interpolate({
    inputRange,
    outputRange: [0, 1],
  });

  const textColor = colorFillingAnimation.interpolate({
    inputRange,
    outputRange: [Colors.ui_grey_15, '#d37c26'],
  });

  const cardBorderColor = colorFillingAnimation.interpolate({
    inputRange,
    outputRange: [Colors.ui_grey_20, '#eda96b'],
  });

  const shineGradientTranslateX = shineAnimation.interpolate({
    inputRange,
    outputRange: [-150, 400],
  });

  const tooltipScaleAnimatedStyles = useAnimatedStyle(() => ({
    transform: [{scale: tooltipScaleAnimation.value}],
  }));

  const handleContinue = () => {
    setLoginStep(LOGIN_STEPS.PASSCODE_REGISTRATION);
  };

  const titleText = isLoading
    ? 'Creating your wallet...'
    : 'Your wallet is ready!';

  const isWalletReady = !isLoading && walletAddress;

  return (
    <View style={styles.container}>
      <View>
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{scale: cardScale}],
              borderColor: cardBorderColor,
            },
          ]}>
          <Animated.View
            style={[
              styles.shineGradientContainer,
              {transform: [{translateX: shineGradientTranslateX}]},
            ]}>
            <CardShineIcon />
          </Animated.View>
          <ImageBackground
            source={Images.cardCat}
            resizeMode="cover"
            style={styles.image}>
            <Animated.View
              style={[
                {
                  ...styles.image,
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                },
                {opacity: orangeImageOpacity},
              ]}>
              <Image
                source={Images.cardCatOrange}
                resizeMode="cover"
                style={{
                  ...styles.image,
                }}
              />
            </Animated.View>
            <View style={styles.card}>
              <Animated.View
                style={[
                  styles.colorCircleContainer,
                  {
                    transform: [{scale: colorCircleScale}],
                    opacity: colorCircleOpacity,
                  },
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
                  {address.slice(2, 6)}
                </Animated.Text>
                <Animated.Text style={[styles.addressText, {color: textColor}]}>
                  ...
                </Animated.Text>
                <Animated.Text style={[styles.addressText, {color: textColor}]}>
                  {address.slice(-5)}
                </Animated.Text>
              </View>
            </View>
          </ImageBackground>
        </Animated.View>
        <Text style={styles.title}>{titleText}</Text>
        <ReAnimated.View
          style={[styles.tooltipContainer, tooltipScaleAnimatedStyles]}>
          <Tooltip text={tooltipText} />
        </ReAnimated.View>
      </View>
      {isWalletReady && <Button text="Continue" onPress={handleContinue} />}
      {isWalletReady && (
        <View style={styles.confettiContainer}>
          <ConfettiAnimation loop={false} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '40%',
    justifyContent: 'space-between',
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
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',
    paddingTop: 18,
    paddingLeft: 14,
    paddingBottom: 17,
    paddingRight: 24,
  },
  title: {
    fontFamily: Fonts.semiBold,
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
  lowerBlock: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
  },
  addressText: {
    fontFamily: Fonts.semiBold,
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
    position: 'relative',
    zIndex: 9,
    borderRadius: 300,
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  shineGradientContainer: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 75,
    height: '100%',
    zIndex: 3,
  },
  shineGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    opacity: 0.2,
    transform: [{rotate: '9,3deg'}],
  },
  tooltipContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 19,
    transformOrigin: 'top',
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
});

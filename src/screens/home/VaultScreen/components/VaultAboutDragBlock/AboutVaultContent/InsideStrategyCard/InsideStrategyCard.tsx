import React, {memo, useEffect, useState} from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {SvgUri} from 'react-native-svg';
import RNFadedScrollView from 'rn-faded-scrollview';

import {Strategy} from '@/shared/types';
import {Colors, Fonts} from '@/shared/ui';
import {abbreviateNumber, formatNumber} from '@/shared/lib/format';
import {
  AMarkIcon,
  ArrowLineIcon,
  DiscountIcon,
  LightingLineIcon,
  PeopleIcon,
} from '@/shared/ui/icons';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {SourceTag} from './SourceTag';

interface Props {
  item: Strategy;
  isOpen?: boolean;
}

export const InsideStrategyCard: React.FC<Props> = memo(({item, isOpen}) => {
  const containerValue = useSharedValue(0);

  const [isShowArrow, setIsShowArrow] = useState(false);

  const [scrollContainerHeight, setScrollContainerHeight] = useState(0);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);

  useEffect(() => {
    containerValue.value = withTiming(
      isOpen ? 1 : 0,
      {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      },
      () => {
        runOnJS(setIsShowArrow)(true);
      },
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const imageContainerStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(containerValue.value, [0, 1], [70, 118]),
    };
  });

  const logoImageContainerStyle = useAnimatedStyle(() => ({
    bottom: `${interpolate(containerValue.value, [0, 1], [-30, -13])}%`,
  }));

  const logoImageStyle = useAnimatedStyle(() => ({
    height: interpolate(containerValue.value, [0, 1], [38, 50]),
    width: interpolate(containerValue.value, [0, 1], [38, 50]),
  }));

  const contentContainerStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(containerValue.value, [0, 1], [28, 33]),
  }));

  const contentItemStyle = useAnimatedStyle(() => ({
    paddingHorizontal: interpolate(containerValue.value, [0, 1], [8, 12]),
  }));

  const nameContainerStyle = useAnimatedStyle(() => ({
    marginBottom: interpolate(containerValue.value, [0, 1], [31, 27]),
  }));

  const weeklyApy = formatNumber(item.apy, 3);
  const riskScore = formatNumber(item.risk_score, 3);

  const isScrollableList = scrollContentHeight > scrollContainerHeight;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.imageContainer, imageContainerStyle]}>
        <ImageBackground
          source={{uri: item.bg_image_url}}
          style={styles.image}
          resizeMode="cover"
        />
        <Animated.View
          style={[styles.logoImageContainer, logoImageContainerStyle]}>
          <Animated.View style={[styles.logoImage, logoImageStyle]}>
            <SvgUri uri={item.logo_image_url} width={'100%'} height={'100%'} />
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Animated.View
        style={[{flex: 1, position: 'relative'}, contentContainerStyle]}>
        <Animated.View
          style={[styles.nameContainer, contentItemStyle, nameContainerStyle]}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.nameSubText}>{`by ${item.protocol}`}</Text>
        </Animated.View>
        <RNFadedScrollView
          bounces={false}
          style={[styles.scrollContainer, {marginBottom: isOpen ? 40 : 0}]}
          showsVerticalScrollIndicator={false}
          allowStartFade={false}
          allowEndFade
          horizontal={false}
          fadeSize={180}
          isCloseToEnd={value => setIsShowArrow(!value)}
          fadeColors={['rgba(248, 242, 239, 0)', 'rgba(248, 242, 239, 1)']}
          onLayout={e => {
            setScrollContainerHeight(e.nativeEvent.layout.height);
          }}
          onContentSizeChange={(_, height) => {
            setScrollContentHeight(height);
          }}>
          <Animated.View style={contentItemStyle}>
            <View style={styles.infoString}>
              <View style={[styles.flexRow]}>
                <View style={styles.infoStringIcon}>
                  <DiscountIcon style={styles.infoStringIcon} />
                </View>
                <Text style={styles.infoStringTitle}>Weekly apy</Text>
              </View>
              <Text style={styles.infoStringValue}>{`${weeklyApy}%`}</Text>
            </View>
            <View style={styles.infoString}>
              <View style={styles.flexRow}>
                <View style={styles.infoStringIcon}>
                  <LightingLineIcon style={styles.infoStringIcon} />
                </View>
                <Text style={styles.infoStringTitle}>Allocation</Text>
              </View>
              <Text
                style={styles.infoStringValue}>{`${item.allocation}%`}</Text>
            </View>
            {isOpen && (
              <>
                <View style={styles.infoString}>
                  <View style={styles.flexRow}>
                    <View style={styles.infoStringIcon}>
                      <AnimatedCircularProgress
                        style={{marginRight: 6, transform: [{scaleX: -1}]}}
                        size={18}
                        width={1.08}
                        rotation={0}
                        delay={300}
                        duration={500}
                        fill={((+item?.tvl || 0) / 4300000) * 100} // TODO Change to allTvl
                        tintColor={Colors.ui_grey_50}
                        backgroundColor={Colors.ui_orange_20}
                      />
                    </View>

                    <Text style={styles.infoStringTitle}>TVL</Text>
                  </View>
                  <View style={styles.flexRow}>
                    <Text style={styles.infoStringValue}>
                      {abbreviateNumber(+item.tvl)}
                    </Text>
                    <Text
                      style={[styles.infoStringTitle, styles.infoSubstring]}>
                      of 4.3m
                    </Text>
                  </View>
                </View>
                <View style={styles.infoString}>
                  <View style={styles.flexRow}>
                    <View style={styles.infoStringIcon}>
                      <AMarkIcon />
                    </View>
                    <Text style={styles.infoStringTitle}>Risk score</Text>
                  </View>
                  <View style={styles.flexRow}>
                    <Text style={styles.infoStringValue}>{riskScore}</Text>
                    <Text
                      style={[styles.infoStringTitle, styles.infoSubstring]}>
                      of 5
                    </Text>
                  </View>
                </View>
                <View style={styles.infoString}>
                  <View style={styles.flexRow}>
                    <View style={styles.infoStringIcon}>
                      <PeopleIcon />
                    </View>
                    <Text style={styles.infoStringTitle}>Holders</Text>
                  </View>
                  <Text style={styles.infoStringValue}>
                    {abbreviateNumber(+item.holders)}
                  </Text>
                </View>

                <Text style={styles.contentTitle}>Strategy overview</Text>

                <Text>{item.overview}</Text>
                <Text style={styles.contentTitle}>Yield source</Text>

                <View style={styles.sourcesContainer}>
                  {item.tags.map(tag => (
                    <SourceTag
                      name={tag.text}
                      imgUrl={tag.image}
                      key={tag.text}
                    />
                  ))}
                </View>
              </>
            )}
          </Animated.View>
        </RNFadedScrollView>
        {isScrollableList && isShowArrow && isOpen && (
          <View style={styles.arrowIconContainer}>
            <ArrowLineIcon
              color={Colors.ui_grey_735}
              style={styles.arrowIcon}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // width: 170,
    // height: 232,
    backgroundColor: Colors.ui_white,
  },
  imageContainer: {
    height: '100%',
    position: 'relative',
  },
  image: {
    flex: 1,
  },

  logoImageContainer: {
    position: 'absolute',
    width: '100%',
    height: 38,
    bottom: '-30%',
    alignItems: 'center',
  },
  logoImage: {
    borderWidth: 2,
    borderColor: Colors.ui_white,
    borderRadius: 25,
  },
  contentContainer: {
    padding: 8,
  },
  nameContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_black_80,
    lineHeight: 22.4,
  },
  nameSubText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_735,
    lineHeight: 20.3,
  },
  infoString: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoStringTitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
  },
  infoStringValue: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.ui_black_80,
  },
  flexRow: {
    flexDirection: 'row',
  },
  infoSubstring: {
    marginLeft: 3,
  },
  infoStringIcon: {
    width: 23,
  },
  scrollContainer: {
    flex: 1,
  },
  contentTitle: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    marginBottom: 8,
    marginTop: 42,
  },
  arrowIconContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  arrowIcon: {
    transform: [
      {
        rotate: '90deg',
      },
    ],
  },
  sourcesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});

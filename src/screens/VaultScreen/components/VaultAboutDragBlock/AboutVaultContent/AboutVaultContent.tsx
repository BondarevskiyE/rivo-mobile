import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ReAnimated, {
  SharedValue,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import {Strategy} from '@/shared/types';
import {Colors, Fonts} from '@/shared/ui';
import {InfoBlock} from './InfoBlock';
import {ScrollView} from 'react-native-gesture-handler';

const AScrollView = ReAnimated.createAnimatedComponent(ScrollView);

interface Props {
  vault: Strategy;
  imageShiftValue: SharedValue<number>;
}

export const AboutVaultContent: React.FC<Props> = ({
  vault,
  imageShiftValue,
}) => {
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(({contentOffset}) => {
    scrollY.value = Math.round(contentOffset.y);
  });
  return (
    <AScrollView
      bounces={false}
      onScroll={scrollHandler}
      showsVerticalScrollIndicator={false}>
      <LinearGradient
        style={{flex: 1, borderRadius: 10}}
        colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}>
        <View style={styles.container}>
          <Text style={styles.title}>Overview</Text>

          <InfoBlock
            descriptionText={vault.description}
            imageShiftValue={imageShiftValue}
            advantages={vault.advantages}
          />
          <InfoBlock
            descriptionText={vault.description}
            imageShiftValue={imageShiftValue}
            advantages={vault.advantages}
          />
        </View>
      </LinearGradient>
    </AScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '90%',
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Colors.ui_black_80,

    marginBottom: 12,
  },
});

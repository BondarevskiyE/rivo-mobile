import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SharedValue} from 'react-native-reanimated';

import {Strategy} from '@/shared/types';
import {Colors, Fonts, Images} from '@/shared/ui';
import {InfoBlock} from './InfoBlock';
import {ExpandableCardList} from '@/components/ExpandableCardList';
import {AccordeonList} from '@/components/AccordeonList';

const accordeonItems = [
  {
    image: Images.services,
    title: 'Mechanics',
    content: (
      <View>
        <Text>
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
        </Text>
      </View>
    ),
  },
  {
    image: Images.heart,
    title: 'Maintaining the index',
    content: (
      <View>
        <Text>
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
        </Text>
      </View>
    ),
  },
  {
    image: Images.stars,
    title: 'Reward distribution',
    content: (
      <View>
        <Text>
          The index is being supported by the Rivo team, consistently managing
          the set of strategies and tokens inside the index. Existing strategies
          can be unwound and replaced under following circumstances: Strategy
          APY falls below the benchmark Strategy, underlying assets or protocols
          are subject to an exploit or are operating under extreme conditions
        </Text>
      </View>
    ),
  },
];

interface Props {
  vault: Strategy;
  imageShiftValue: SharedValue<number>;
}

export const AboutVaultContent: React.FC<Props> = ({
  vault,
  imageShiftValue,
}) => {
  return (
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
        <Text style={[styles.title, styles.titleMargin]}>Index management</Text>
        <AccordeonList items={accordeonItems} />
        {/* <ExpandableCardList /> */}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    // height: '90%',
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 150,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Colors.ui_black_80,

    marginBottom: 12,
  },
  titleMargin: {
    marginTop: 80,
  },
});

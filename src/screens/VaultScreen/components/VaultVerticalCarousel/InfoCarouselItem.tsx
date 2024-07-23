import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

import {Colors, Fonts} from '@/shared/ui';
import {Strategy} from '@/shared/types';
import {EthereumIcon, HoldersIcon} from '@/shared/ui/icons';
import {abbreviateNumber} from '@/shared/lib/format';

interface Props {
  vault: Strategy;
}

export const InfoCarouselItem: React.FC<Props> = ({vault}) => {
  return (
    <View style={styles.container}>
      <View style={styles.apyBlock}>
        <EthereumIcon />
        <Text style={styles.apyText}>{vault.apy}%</Text>
        <Text style={styles.nameText}>{vault.name} APY</Text>
        <View />
      </View>
      <View style={styles.characteristicsBlock}>
        <View style={styles.block}>
          <View style={styles.blockImage}>
            <AnimatedCircularProgress
              style={{transform: [{scaleX: -1}]}}
              size={40}
              width={2.4}
              rotation={0}
              delay={300}
              duration={500}
              fill={(vault.tvl / vault.allTvl) * 100}
              tintColor={Colors.ui_grey_13}
              backgroundColor={Colors.ui_grey_95}
            />
          </View>
          <View>
            <Text style={styles.whiteText}>{abbreviateNumber(vault.tvl)}</Text>
            <Text style={styles.greyText}>
              of {abbreviateNumber(vault.allTvl)} TVL
            </Text>
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.blockImage}>
            <View style={styles.holdersIconContainer}>
              <HoldersIcon />
            </View>
          </View>
          <View>
            <Text style={styles.whiteText}>
              {abbreviateNumber(vault.holders)}
            </Text>
            <Text style={styles.greyText}>Holders</Text>
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.blockImage}>
            <View style={styles.riskLevelIconContainer}>
              <Text style={styles.riskLevelGrade}>A</Text>
            </View>
          </View>
          <View>
            <Text style={styles.whiteText}>
              {vault.riskLevel}
              {/** TODO change color depending on riskLevel*/}
            </Text>
            <Text style={styles.greyText}>Risk Level</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 325,
    width: '100%',
    borderRadius: 32,
    padding: 20,
    backgroundColor: Colors.ui_black_65,
    marginBottom: 8,
  },
  apyBlock: {
    marginTop: 20,
    marginBottom: 57,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  apyText: {
    fontFamily: Fonts.semiBold,
    color: Colors.ui_white,
    fontSize: 22,
    lineHeight: 22,
    marginTop: 20,
    marginBottom: 4,
  },
  nameText: {
    fontFamily: Fonts.regular,
    lineHeight: 22.4,
    color: Colors.ui_grey_65,
  },
  characteristicsBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  block: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 85,
    height: 98,
  },
  blockImage: {
    width: 40,
    height: 40,
  },
  holdersIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.ui_grey_97,
  },
  whiteText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Colors.ui_white,
    textAlign: 'center',
  },
  greyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20.3,
    color: Colors.ui_grey_73,
    textAlign: 'center',
  },
  riskLevelIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.ui_green_80,
  },
  riskLevelGrade: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.ui_green_40,
  },
});

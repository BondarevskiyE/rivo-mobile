import React from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SharedValue} from 'react-native-reanimated';

import {Strategy} from '@/shared/types';
import {Colors, Fonts, Images} from '@/shared/ui';
import {InfoBlock} from './InfoBlock';
import {AccordeonList} from '@/components/AccordeonList';
import {ExternalLinkTag, RiskScoreCounter} from '@/components';
import {InfoQuestionIcon, OrangePlusCircleIcon} from '@/shared/ui/icons';
import {indexManagmentItems, riskScoringAccordeonItems} from './mocks';

interface Props {
  vault: Strategy;
  imageShiftValue: SharedValue<number>;
}

export const AboutVaultContent: React.FC<Props> = ({
  vault,
  imageShiftValue,
}) => {
  const riskScore = vault.riskLevel * 2 * 10;

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
        <AccordeonList items={indexManagmentItems} />

        <Text style={[styles.title, styles.titleMargin]}>Risk scoring</Text>
        <View style={styles.riskScoreContainer}>
          <RiskScoreCounter percent={riskScore} />
          {vault?.audits?.length && (
            <ScrollView
              bounces={false}
              style={styles.auditScroll}
              contentContainerStyle={styles.auditScrollContainer}
              horizontal
              showsHorizontalScrollIndicator={false}>
              <View style={styles.risksSummary}>
                <OrangePlusCircleIcon />
                <Text style={styles.risksSummaryText}>Risks summary</Text>
              </View>
              {vault.audits.map(audit => (
                <ExternalLinkTag
                  url={audit.url}
                  iconUrl={audit.iconUrl}
                  key={audit.name}>
                  {audit.name}
                </ExternalLinkTag>
              ))}
            </ScrollView>
          )}
        </View>
        <AccordeonList items={riskScoringAccordeonItems} />

        <Text style={[styles.title, styles.titleMargin]}>Fee structure</Text>

        <View style={styles.feeStructure}>
          <View style={styles.feeStructureItem}>
            <Image
              source={Images.fivePercent}
              style={styles.feeStructureImage}
            />
            <View style={styles.feeStructureItemTextContainer}>
              <Text>Performance fee</Text>
              <InfoQuestionIcon />
            </View>
          </View>
          <View style={styles.feeStructureItem}>
            <Image
              source={Images.tenPercent}
              style={styles.feeStructureImage}
            />
            <View style={styles.feeStructureItemTextContainer}>
              <Text>Performance fee</Text>
              <InfoQuestionIcon />
            </View>
          </View>
        </View>

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
    paddingBottom: 200,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Colors.ui_black_80,

    marginBottom: 14,
  },
  titleMargin: {
    marginTop: 80,
  },
  riskScoreContainer: {
    backgroundColor: Colors.ui_white,
    paddingBottom: 12,
    paddingTop: 20,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 8,
  },
  auditScroll: {
    marginTop: 24,
  },
  auditScrollContainer: {
    gap: 12,
    paddingHorizontal: 12,
  },
  risksSummary: {
    borderRadius: 30,
    padding: 6,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: Colors.ui_orange_20,
    gap: 4,
  },
  risksSummaryText: {
    fontSize: 14,
    color: Colors.ui_orange_80,
    fontFamily: Fonts.medium,
  },
  feeStructure: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 26,
  },
  feeStructureImage: {
    width: 93,
    height: 65,
  },
  feeStructureItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  feeStructureItemTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4.6,
  },
});

import React, {useMemo} from 'react';
import {Text, View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import Modal from '@/modal-manager';
import {ExpandableCard, RiskScoreCounter, ExternalLinkTag} from '@/components';
import {AccordeonList} from '@/components/AccordeonList';
import {Images, Colors, Fonts} from '@/shared/ui';
import {
  ArrowLineIcon,
  OrangePlusCircleIcon,
  InfoQuestionIcon,
} from '@/shared/ui/icons';

import {InsideStrategyCard} from '../InsideStrategyCard';
import {Vault} from '@/shared/types';
import {
  getIndexManagmentAccordeonItems,
  getRiskScoringAccordeonItems,
} from './helpers';

import {MethodologyModal} from './MethodologyModal';
import {isAndroid} from '@/shared/helpers/system';

function openMethodologyModal() {
  Modal.show({
    children: <MethodologyModal />,
    dismissable: true,
    position: 'bottom',
  });
}

interface Props {
  vault: Vault;
  setIsInvestButtonShown: (isShown: boolean) => void;
}

export const LazyContentBlock: React.FC<Props> = ({
  vault,
  setIsInvestButtonShown,
}) => {
  const riskScore = vault.risk_level * 2 * 10;

  const indexManagmentAccordeonItems = useMemo(
    () =>
      getIndexManagmentAccordeonItems({
        mechanics: vault.mechanics,
        maintance: vault.maintance,
        rewards: vault.rewards,
      }),
    [vault],
  );

  const riskScoringAccordeonItems = useMemo(
    () =>
      getRiskScoringAccordeonItems({
        smart_ctr_sec_score: vault.smart_ctr_sec_score,
        smart_ctr_sec_text: vault.smart_ctr_sec_text,
        user_metrics_score: vault.user_metrics_score,
        user_metrics_text: vault.user_metrics_text,
        complexity_score: vault.complexity_score,
        complexity_text: vault.complexity_text,
        quality_underlying_asset_score: vault.quality_underlying_asset_score,
        quality_underlying_asset_text: vault.quality_underlying_asset_text,
      }),
    [vault],
  );
  return (
    <>
      <Text
        style={[styles.title, styles.titleMarginBottom, styles.titleMarginTop]}>
        Inside the index
      </Text>

      <ScrollView
        horizontal
        bounces={false}
        removeClippedSubviews={false}
        showsHorizontalScrollIndicator={false}
        style={{zIndex: 9, overflow: 'visible'}}
        contentContainerStyle={{gap: 8, overflow: 'visible'}}>
        {vault.strategies?.map(item => (
          <ExpandableCard
            onPress={setIsInvestButtonShown}
            disableExpandEnimation={isAndroid}
            key={item.address}>
            <InsideStrategyCard item={item} key={item.address} />
          </ExpandableCard>
        ))}
      </ScrollView>

      <Text
        style={[styles.title, styles.titleMarginBottom, styles.titleMarginTop]}>
        Index management
      </Text>
      <AccordeonList items={indexManagmentAccordeonItems} />

      <View
        style={[
          styles.flexRowContainer,
          styles.titleMarginTop,
          styles.titleMarginBottom,
        ]}>
        <Text style={[styles.title]}>Risk scoring</Text>
        <TouchableOpacity
          style={styles.methodologyContainer}
          onPress={openMethodologyModal}>
          <Text style={styles.methodologyText}>Methodology</Text>
          <ArrowLineIcon color={Colors.ui_grey_72} width={8} height={8} />
        </TouchableOpacity>
      </View>
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
                iconUrl={audit.image}
                key={audit.text}>
                {audit.text}
              </ExternalLinkTag>
            ))}
          </ScrollView>
        )}
      </View>
      <AccordeonList items={riskScoringAccordeonItems} />

      <Text
        style={[styles.title, styles.titleMarginBottom, styles.titleMarginTop]}>
        Fee structure
      </Text>

      <View style={styles.feeStructure}>
        <View style={styles.feeStructureItem}>
          <Image source={Images.fivePercent} style={styles.feeStructureImage} />
          <View style={styles.feeStructureItemTextContainer}>
            <Text>Performance fee</Text>
            <InfoQuestionIcon />
          </View>
        </View>
        <View style={styles.feeStructureItem}>
          <Image source={Images.tenPercent} style={styles.feeStructureImage} />
          <View style={styles.feeStructureItemTextContainer}>
            <Text>Managment fee</Text>
            <InfoQuestionIcon />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Colors.ui_black_80,
  },
  titleMarginBottom: {
    marginBottom: 14,
  },
  titleMarginTop: {
    marginTop: 80,
  },
  flexRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  methodologyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  methodologyText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.ui_grey_72,
  },
});

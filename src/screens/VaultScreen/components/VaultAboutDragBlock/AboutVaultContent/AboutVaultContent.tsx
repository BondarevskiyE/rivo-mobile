import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SharedValue} from 'react-native-reanimated';

import {Vault} from '@/shared/types';
import {Colors, Fonts, Images} from '@/shared/ui';
import {InfoBlock} from './InfoBlock';
import {AccordeonList} from '@/components/AccordeonList';
import {ExpandableCard, ExternalLinkTag, RiskScoreCounter} from '@/components';
import Modal from '@/modal-manager';
import {
  ArrowLineIcon,
  InfoQuestionIcon,
  OrangePlusCircleIcon,
} from '@/shared/ui/icons';
import {indexManagmentItems, riskScoringAccordeonItems} from './mocks';

import {InsideStrategyCard} from './InsideStrategyCard';
import {IndexUpdates} from './IndexUpdates';
import {MethodologyModal} from './MethodologyModal';

function openMethodologyModal() {
  Modal.show({
    children: <MethodologyModal />,
    dismissable: true,
    position: 'bottom',
  });
}

interface Props {
  vault: Vault;
  imageShiftValue: SharedValue<number>;
  setIsInvestButtonShown: (isShown: boolean) => void;
}

export const AboutVaultContent: React.FC<Props> = ({
  vault,
  imageShiftValue,
  setIsInvestButtonShown,
}) => {
  const riskScore = vault.riskLevel * 2 * 10;

  return (
    <LinearGradient
      style={{flex: 1, borderRadius: 10}}
      colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}>
      <View style={styles.container}>
        <View style={[styles.flexRowContainer, styles.titleMarginBottom]}>
          <Text style={styles.title}>Overview</Text>
          <IndexUpdates />
        </View>

        <InfoBlock
          descriptionText={vault.description}
          imageShiftValue={imageShiftValue}
          advantages={vault.advantages}
        />
        <Text
          style={[
            styles.title,
            styles.titleMarginBottom,
            styles.titleMarginTop,
          ]}>
          Inside the index
        </Text>

        {vault.strategiesInside && (
          <ScrollView
            horizontal
            bounces={false}
            showsHorizontalScrollIndicator={false}
            style={{flex: 1, overflow: 'visible', zIndex: 9}}
            contentContainerStyle={{gap: 8}}>
            {vault.strategiesInside.map(item => (
              <ExpandableCard onPress={setIsInvestButtonShown} key={item.name}>
                <InsideStrategyCard item={item} />
              </ExpandableCard>
            ))}
          </ScrollView>
        )}

        <Text
          style={[
            styles.title,
            styles.titleMarginBottom,
            styles.titleMarginTop,
          ]}>
          Index management
        </Text>
        <AccordeonList items={indexManagmentItems} />

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
                  iconUrl={audit.iconUrl}
                  key={audit.name}>
                  {audit.name}
                </ExternalLinkTag>
              ))}
            </ScrollView>
          )}
        </View>
        <AccordeonList items={riskScoringAccordeonItems} />

        <Text
          style={[
            styles.title,
            styles.titleMarginBottom,
            styles.titleMarginTop,
          ]}>
          Fee structure
        </Text>

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

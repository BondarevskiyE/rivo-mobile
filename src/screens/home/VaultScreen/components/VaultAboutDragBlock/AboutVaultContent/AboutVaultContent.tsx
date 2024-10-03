import React, {Suspense, lazy} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SharedValue} from 'react-native-reanimated';

import {Vault} from '@/shared/types';
import {Colors, Fonts} from '@/shared/ui';
import {InfoBlock} from './InfoBlock';

import {IndexUpdates} from './IndexUpdates';
import {Loader} from '@/components/Loader';

const LazyContent = lazy(() => import('./LazyContentBlock'));

const {width: WIDTH_SCREEN} = Dimensions.get('window');

interface Props {
  vault: Vault;
  imageShiftValue: SharedValue<number>;
  setIsInvestButtonShown: (isShown: boolean) => void;
  openInvestForm: () => void;
  openWithdrawForm: () => void;
}

export const AboutVaultContent: React.FC<Props> = ({
  vault,
  imageShiftValue,
  setIsInvestButtonShown,
  openInvestForm,
  openWithdrawForm,
}) => {
  return (
    <LinearGradient
      style={{flex: 1, borderRadius: 10}}
      colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}>
      <View style={styles.container}>
        <View style={[styles.flexRowContainer, styles.titleMarginBottom]}>
          <Text style={styles.title}>Overview</Text>
          <IndexUpdates vault={vault} />
        </View>

        <InfoBlock
          vault={vault}
          descriptionText={vault.description}
          imageShiftValue={imageShiftValue}
          advantages={vault.advantages}
          openInvestForm={openInvestForm}
          openWithdrawForm={openWithdrawForm}
        />

        <Suspense
          fallback={
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          }>
          <LazyContent
            vault={vault}
            setIsInvestButtonShown={setIsInvestButtonShown}
          />
        </Suspense>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 230,
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
  loaderContainer: {
    width: WIDTH_SCREEN,
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

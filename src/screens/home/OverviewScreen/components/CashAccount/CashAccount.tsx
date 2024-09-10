import {formatNumber} from '@/shared/lib/format';
import {Colors, Fonts} from '@/shared/ui';
import {DollarIconWithShadow} from '@/shared/ui/icons';
// import {ArrowUpIcon} from '@/shared/ui/icons/ArrowUpIcon';
import {useBalanceStore} from '@/store/useBalanceStore';

import {StyleSheet, Text, View} from 'react-native';

export const CashAccount = () => {
  const cashAccountBalance = useBalanceStore(state => state.cashAccountBalance);
  const [cashAccountBalanceInteger, cashAccountBalanceFraction] =
    formatNumber(cashAccountBalance).split('.');

  return (
    <View style={styles.container}>
      <View style={styles.leftBlock}>
        <DollarIconWithShadow
          color={Colors.ui_green_50}
          shadowColor={'rgba(92, 185, 36, 0.1)'}
          width={36}
          height={36}
          distance={15}
          style={styles.dollarIcon}
        />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Cash Account</Text>
          {/* <Text style={styles.subTitle}>4% APY from US Treasury</Text> */}
        </View>
      </View>
      <View>
        <View style={styles.cashAccountValue}>
          <Text style={styles.cashAccountDollar}>$</Text>
          <Text style={styles.cashAccountInteger}>
            {cashAccountBalanceInteger}
          </Text>
          <Text style={styles.cashAccountFraction}>{`.${
            cashAccountBalanceFraction || 0
          }`}</Text>
        </View>
        {/* <View style={styles.apyValueContainer}>
          <ArrowUpIcon />
          <Text style={styles.apyValue}>$0</Text>
        </View> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 18,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 75,

    backgroundColor: Colors.ui_white,
    borderRadius: 24,
  },
  leftBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dollarIcon: {
    marginRight: 10,
  },
  titleContainer: {
    gap: 2,
  },
  title: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Colors.ui_black_80,
  },
  subTitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
    lineHeight: 20.3,
    letterSpacing: -0.04,
  },
  cashAccountValue: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cashAccountDollar: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Colors.ui_grey_75,
  },
  cashAccountInteger: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Colors.ui_black,
  },
  cashAccountFraction: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.ui_black,
    marginLeft: -1,
  },
  apyValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  apyValue: {
    fontFamily: Fonts.medium,
    lineHeight: 20.3,
    fontSize: 14,
    marginLeft: 2,
    color: Colors.ui_grey_70,
  },
});

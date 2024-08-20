import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {RandomReveal} from '@/components/RandomReveal';

import {formatNumber} from '@/shared/lib/format';
import {Colors, Fonts} from '@/shared/ui';

interface Props {
  value: string;
  apy: number;
}

export const InvestEstimate: React.FC<Props> = ({value, apy}) => {
  const isInputZero = value === '' || value === '0';
  return (
    <View>
      <View style={styles.row}>
        <Text style={[styles.text, styles.greyText]}>Yield APY:</Text>
        <Text style={[styles.text, styles.greenText]}>{`${formatNumber(
          apy,
          3,
        )}%`}</Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.text, styles.greyText]}>
          Estimated Yearly Yield:
        </Text>
        <Text style={[styles.text, styles.greenText]}>
          {isInputZero ? (
            '-'
          ) : (
            <RandomReveal
              value={`+$${formatNumber((+value * apy) / 100, 3)}`}
            />
          )}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.text, styles.greyText]}>
          Rivo Points per week:
        </Text>
        <Text style={[styles.text, styles.orangeText]}>
          {isInputZero ? (
            '-'
          ) : (
            <RandomReveal value={formatNumber(+value * 0.002, 3)} />
          )}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.text, styles.greyText]}>Rewards fee:</Text>
        <Text style={[styles.text, styles.greyText]}>10%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
  },
  greyText: {
    color: Colors.grey_text,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  greenText: {
    color: Colors.ui_green_45,
  },
  orangeText: {
    color: Colors.ui_orange_80,
  },
});

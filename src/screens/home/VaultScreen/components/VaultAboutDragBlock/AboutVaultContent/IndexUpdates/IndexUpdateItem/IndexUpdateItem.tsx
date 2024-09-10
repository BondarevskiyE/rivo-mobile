import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import DashedLine from 'react-native-dashed-line';

import {Colors, Fonts} from '@/shared/ui';
import {IndexUpdateWithActiveStatus} from '../helpers';

interface Props {
  update: IndexUpdateWithActiveStatus;
  isLastItem: boolean;
}

export const IndexUpdateItem: React.FC<Props> = ({update, isLastItem}) => {
  return (
    <View style={styles.container}>
      {!isLastItem ? (
        <DashedLine
          axis="vertical"
          dashLength={5}
          dashThickness={2}
          dashColor={Colors.ui_grey_25}
          dashGap={6}
          style={styles.dash}
        />
      ) : (
        <View style={[styles.dash, styles.dashMock]} />
      )}

      <View style={styles.itemContainer}>
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: update.isActive
                ? Colors.ui_green_55
                : Colors.ui_grey_42,
            },
          ]}
        />
        <View>
          <Text style={styles.textDate}>
            {new Date(update.date).toLocaleDateString()}
          </Text>

          <Text style={styles.text}>{update.description}</Text>
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 11,
    paddingLeft: 13,
    // height: 65,
  },
  dash: {
    position: 'relative',
    top: 7,
    minHeight: 60,
    maxHeight: 70,
  },
  dashMock: {
    paddingLeft: 1.5,
  },
  itemContainer: {
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    left: -17,
    top: 3,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 1,
    borderColor: Colors.ui_white,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.ui_black_55,
  },
  textDate: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_735,
  },
});

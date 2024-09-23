import {Fragment} from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

import {Colors, Fonts, Images} from '@/shared/ui';
import {PointsTxItem} from './types';
import {getTimeString} from '@/shared/helpers/time';

interface Props {
  items: PointsTxItem[];
}

export const PointsTransactionsItem: React.FC<Props> = ({items}) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const time = getTimeString(item.time);

        return (
          <Fragment key={`${item.time}-${item.points}`}>
            <View style={[styles.item, styles.row]}>
              <Image
                source={Images.pointsStar}
                style={styles.pointsStarIcon}
                resizeMode="contain"
              />
              <View style={styles.content}>
                <View style={[styles.row, styles.contentText]}>
                  <Text style={styles.nameText}>{item.name}</Text>
                  <Text
                    style={styles.pointsText}>{`+${item.points} Points`}</Text>
                </View>
                <Text style={styles.timeText}>{time}</Text>
              </View>
            </View>
            {index !== items.length - 1 && <View style={styles.dividerLine} />}
          </Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Colors.ui_grey_98,

    marginBottom: 40,
  },
  item: {
    padding: 16,
    gap: 8,
  },
  pointsStarIcon: {
    height: 32,
    width: 32,
  },
  dividerLine: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.ui_black_55,
  },
  row: {
    flexDirection: 'row',
  },
  content: {
    flexGrow: 1,
    gap: 4,
  },
  contentText: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_white,
  },
  pointsText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_orange_80,
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_73,
  },
});

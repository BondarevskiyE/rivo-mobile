import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {StackScreenProps} from '@react-navigation/stack';

import {createItemsMapByDate} from '@/shared/helpers/mapByDate';
import {ArrowLineIcon} from '@/shared/ui/icons';
import {PointsStackProps, POINTS_SCREENS} from '@/navigation/types/pointsStack';
import {Colors, Fonts, Images} from '@/shared/ui';
import {PointsTxItem} from './types';
import {ScrollView} from 'react-native-gesture-handler';
import {PointsTransactionsItem} from './PointsTransactionsItem';

type Props = StackScreenProps<
  PointsStackProps,
  POINTS_SCREENS.POINTS_HISTORY_SCREEN
>;

const pointsTxs: PointsTxItem[] = [
  {
    name: 'Daily investing',
    time: 1726481239214,
    points: 997,
  },
  {
    name: 'Daily investing',
    time: 1726481239213,
    points: 999,
  },
  {
    name: 'Referral points',
    time: 1626481239214,
    points: 99,
  },
  {
    name: 'Daily investing',
    time: 1722481239214,
    points: 9,
  },
];

export const PointsHistoryScreen: React.FC<Props> = ({navigation}) => {
  const onCloseScreen = () => {
    navigation.navigate(POINTS_SCREENS.POINTS_MENU_SCREEN);
  };

  const pointsTxsMapByDate = createItemsMapByDate(pointsTxs, 'time');

  const pointsTxsMapByDateEntries = Object.entries(pointsTxsMapByDate);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={onCloseScreen} style={styles.backIconContainer}>
          <ArrowLineIcon width={14} height={14} color={Colors.ui_white} />
        </Pressable>

        {pointsTxsMapByDateEntries.length ? (
          <ScrollView
            contentContainerStyle={styles.scrollList}
            showsVerticalScrollIndicator={false}>
            {pointsTxsMapByDateEntries.map(([date, txs], index) => (
              <View key={date}>
                <Text style={styles.dateText}>{date}</Text>
                <PointsTransactionsItem items={txs} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noPointsContainer}>
            <Image
              source={Images.noPointsHistoryBg}
              style={styles.noPointsImage}
              resizeMode="contain"
            />
            <Text style={styles.noPointsText}>
              No points here yet. Time to change that&nbsp;- complete your first
              task
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    position: 'relative',
    flex: 1,
    backgroundColor: Colors.ui_black,
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  backIconContainer: {
    position: 'absolute',
    top: 0,
    left: 18,
    zIndex: 5,

    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ui_black_64,
    justifyContent: 'center',
    alignItems: 'center',

    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
  scrollList: {
    paddingTop: 88,
    paddingBottom: 90,
    paddingHorizontal: 12,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
    marginLeft: 4,
    marginBottom: 12,
  },
  noPointsContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  noPointsImage: {
    height: 180,
  },
  noPointsText: {
    top: -20,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_69,
    textAlign: 'center',
    paddingHorizontal: 59,
  },
});

import {Image, StyleSheet, Text, View} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {formatNumber} from '@/shared/lib/format';
import {ArrowUpIcon} from '@/shared/ui/icons/ArrowUpIcon';
import {ListItem} from './LeaderboardList';

type Props = ListItem & {
  weekChanges?: 'down' | 'up';
  weekPlaceChanges?: number;
};

export const LeaderboardListItem: React.FC<Props> = ({
  photoUrl,
  name,
  pointsAmount,
  place,
  weekChanges,
  weekPlaceChanges,
}) => {
  return (
    <View style={styles.container}>
      <Image source={{uri: photoUrl}} style={styles.photo} />
      <View style={styles.contentContainer}>
        <View style={{gap: 2}}>
          <Text style={styles.upperText}>{name}</Text>
          <Text
            style={
              styles.lowerText
            }>{`${formatNumber(pointsAmount)} points`}</Text>
        </View>

        <View style={{gap: 2, alignItems: 'flex-end'}}>
          <Text style={styles.upperText}>{`#${place}`}</Text>
          {weekChanges && weekPlaceChanges && (
            <View style={styles.weekChangesContainer}>
              {weekChanges === 'up' ? (
                <ArrowUpIcon color={Colors.ui_green_51} />
              ) : (
                <ArrowUpIcon
                  color={Colors.ui_red_80} // FIX down arrow color
                  style={{transform: [{rotate: '180deg'}]}}
                />
              )}
              <Text
                style={
                  styles.lowerText
                }>{`${weekChanges === 'up' ? 'Up' : 'Down'} ${weekPlaceChanges} since last week`}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.ui_grey_98,
    borderRadius: 24,

    flexDirection: 'row',
    gap: 8,
  },
  photo: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  contentContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upperText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_white,
  },
  lowerText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_73,
  },
  weekChangesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});

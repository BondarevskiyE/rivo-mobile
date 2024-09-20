import {Colors} from '@/shared/ui';
import {StyleSheet} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {LeaderboardListItem} from './LeaderboardListItem';

export type ListItem = {
  photoUrl: string;
  name: string;
  pointsAmount: string;
  place: string;
};

interface Props {
  userItem: ListItem;
  items: ListItem[];
}

export const LeaderboardList: React.FC<Props> = ({userItem, items}) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.listContent}>
      <LeaderboardListItem
        photoUrl={userItem.photoUrl}
        name={userItem.name}
        pointsAmount={userItem.pointsAmount}
        place={userItem.place}
        weekChanges="up"
        weekPlaceChanges={27}
      />
      {items.map(item => (
        <LeaderboardListItem
          photoUrl={item.photoUrl}
          name={item.name}
          pointsAmount={item.pointsAmount}
          place={item.place}
          key={item.place}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.ui_black,
  },
  listContent: {
    gap: 8,
    paddingBottom: 50,
  },
});

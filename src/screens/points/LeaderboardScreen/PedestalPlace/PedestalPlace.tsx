import {formatNumber} from '@/shared/lib/format';
import {Colors, Fonts} from '@/shared/ui';
import {BronzePlaceLeaderboardIcon} from '@/shared/ui/icons/BronzePlaceLeaderboardIcon';
import {GoldPlaceLeaderboardIcon} from '@/shared/ui/icons/GoldPlaceLeaderboardIcon';
import {SilverPlaceLeaderboardIcon} from '@/shared/ui/icons/SilverPlaceLeaderboardIcon';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

export enum PedestalPlaceType {
  GOLD = 'gold',
  SILVER = 'silver',
  BRONZE = 'bronze',
}

interface Props {
  place: PedestalPlaceType;
  photoUrl: string;
  points: string;
  name: string;

  containerStyles?: StyleProp<ViewStyle>;
}

const getIcon = (place: PedestalPlaceType) => {
  switch (place) {
    case PedestalPlaceType.BRONZE:
      return BronzePlaceLeaderboardIcon;

    case PedestalPlaceType.SILVER:
      return SilverPlaceLeaderboardIcon;

    case PedestalPlaceType.GOLD:
      return GoldPlaceLeaderboardIcon;
  }
};

export const PedestalPlace: React.FC<Props> = ({
  place,
  photoUrl,
  name,
  points,
  containerStyles,
}) => {
  const PlaceIcon = getIcon(place);

  return (
    <View style={[styles.container, containerStyles]}>
      <Image source={{uri: photoUrl}} style={styles.photo} />
      <PlaceIcon style={styles.placeIcon} />
      <Text style={styles.nameText}>{name}</Text>
      <Text style={styles.pointsText}>{formatNumber(points)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 96,
  },
  placeIcon: {
    position: 'absolute',
  },
  photo: {
    top: -2,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignSelf: 'center',
  },
  nameText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_white,
    alignSelf: 'center',
    lineHeight: 22.4,
  },
  pointsText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.ui_beige_61,
    alignSelf: 'center',
    lineHeight: 20.3,
  },
});

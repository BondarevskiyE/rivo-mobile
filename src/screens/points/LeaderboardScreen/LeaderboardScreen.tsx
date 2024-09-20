import {Dimensions, Image, Pressable, StyleSheet, View} from 'react-native';
import {
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {StackScreenProps} from '@react-navigation/stack';

import {ArrowLineIcon} from '@/shared/ui/icons';
import {Colors, Images} from '@/shared/ui';
import {POINTS_SCREENS, PointsStackProps} from '@/navigation/types/pointsStack';
import {PedestalPlace} from './PedestalPlace';
import {PedestalPlaceType} from './PedestalPlace/PedestalPlace';
import {useUserStore} from '@/store/useUserStore';
import {DEFAULT_USER_PHOTO} from '@/shared/constants';
import {LeaderboardList} from './LeaderboardList';
import {usePointsStore} from '@/store/usePointsStore';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type Props = StackScreenProps<
  PointsStackProps,
  POINTS_SCREENS.LEADERBOARD_SCREEN
>;

export const LeaderboardScreen: React.FC<Props> = ({navigation}) => {
  const user = useUserStore(state => state.userInfo);

  const points = usePointsStore(state => state.points);

  const onCloseScreen = () => {
    navigation.goBack();
  };

  const usetListItem = {
    photoUrl: user?.photo || DEFAULT_USER_PHOTO,
    name: user?.givenName || '',
    pointsAmount: points.toString(),
    place: '1',
  };

  const listItems = [
    {
      photoUrl: user?.photo || DEFAULT_USER_PHOTO,
      name: `${user?.givenName || ''} Doe`,
      pointsAmount: '11318',
      place: '2',
    },
    {
      photoUrl: user?.photo || DEFAULT_USER_PHOTO,
      name: `${user?.givenName || ''} Mavrodi`,
      pointsAmount: '9737',
      place: '3',
    },
    {
      photoUrl: user?.photo || DEFAULT_USER_PHOTO,
      name: `${user?.givenName || ''} Johnson`,
      pointsAmount: '4229',
      place: '4',
    },
    {
      photoUrl: user?.photo || DEFAULT_USER_PHOTO,
      name: `${user?.givenName || ''} Sultan`,
      pointsAmount: '1080',
      place: '5',
    },
    {
      photoUrl: user?.photo || DEFAULT_USER_PHOTO,
      name: `${user?.givenName || ''} NoName`,
      pointsAmount: '1',
      place: '6',
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={onCloseScreen} style={styles.backIconContainer}>
          <ArrowLineIcon width={12} height={12} color={Colors.ui_white} />
        </Pressable>

        <Image
          resizeMode="contain"
          source={Images.pointsLeaderboardBg}
          style={styles.imageBackground}
        />

        <View style={styles.pedestalContainer}>
          <PedestalPlace
            place={PedestalPlaceType.GOLD}
            photoUrl={user?.photo || DEFAULT_USER_PHOTO}
            name={user?.givenName || ''}
            points={`${points}`}
            containerStyles={styles.goldPlace}
          />
          <PedestalPlace
            place={PedestalPlaceType.SILVER}
            photoUrl={user?.photo || DEFAULT_USER_PHOTO}
            name={user?.givenName || ''}
            points={`${points}`}
            containerStyles={styles.silverPlace}
          />
          <PedestalPlace
            place={PedestalPlaceType.BRONZE}
            photoUrl={user?.photo || DEFAULT_USER_PHOTO}
            name={user?.givenName || ''}
            points={`${points}`}
            containerStyles={styles.bronzePlace}
          />
          <Image
            resizeMode="cover"
            source={Images.pointsPedestal}
            style={styles.pedestalImage}
          />
        </View>
        <LeaderboardList userItem={usetListItem} items={listItems} />
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
    paddingTop: 19,
  },
  imageBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH + 100,
    height: 554,
    left: -50,
    top: -(initialWindowMetrics?.insets.top || 0),
  },
  pedestalContainer: {
    overflow: 'hidden',
    paddingTop: 20,
    height: 350,
  },
  pedestalImage: {
    width: SCREEN_WIDTH + 20,

    height: 450,
  },
  backIconContainer: {
    position: 'absolute',
    top: 0,
    left: 18,
    zIndex: 5,

    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ui_black_50,
    justifyContent: 'center',
    alignItems: 'center',

    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
  goldPlace: {
    alignSelf: 'center',
    bottom: 238,
  },
  silverPlace: {
    alignSelf: 'center',
    right: 10,
    bottom: 175,
  },
  bronzePlace: {
    alignSelf: 'center',
    left: 8,
    bottom: 145,
  },
});

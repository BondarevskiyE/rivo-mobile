import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import {StackScreenProps} from '@react-navigation/stack';

import {Colors, Fonts, Images} from '@/shared/ui';
import {usePointsStore} from '@/store/usePointsStore';
import {PointsAmount} from './PointsAmount';
import {formatNumber} from '@/shared/lib/format';
import {ReferFriend} from './ReferFriend';
import {POINTS_SCREENS, PointsStackProps} from '@/navigation/types/pointsStack';
import {Header} from './Header';
import {PointsTask} from './PointsTask/PointsTask';
import {TaskType} from './PointsTask/types';
import {ScrollView} from 'react-native-gesture-handler';
import {TimeIcon} from '@/shared/ui/icons/TimeIcon';
import {InfoQuestionIcon} from '@/shared/ui/icons';
import {openInAppBrowser} from '@/shared/helpers/url';
import {RivoPointsDocUrl} from '@/shared/constants/links';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type Props = StackScreenProps<
  PointsStackProps,
  POINTS_SCREENS.POINTS_MENU_SCREEN
>;

export const PointsMenuScreen: React.FC<Props> = ({navigation}) => {
  const {points, activeParticipants} = usePointsStore(state => ({
    points: state.points,
    activeParticipants: state.activeParticipants,
  }));

  const onGoToPointsHistoryScreen = () => {
    navigation.navigate(POINTS_SCREENS.POINTS_HISTORY_SCREEN);
  };

  const onOpenPointsDocs = () => {
    openInAppBrowser(RivoPointsDocUrl);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        <Header />

        <Image
          source={Images.pointsScreenBackground}
          resizeMode="contain"
          style={styles.imageBackground}
        />
        <Image
          source={Images.coin1}
          resizeMode="contain"
          style={styles.coin1Image}
        />
        <Image
          source={Images.coin2}
          style={styles.coin2Image}
          resizeMode="contain"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.pointsAmountContainer}>
            <PointsAmount value={points} />
            <Text style={styles.earnText}>Earn points - get airdrop!</Text>
            <Text
              style={
                styles.participantsText
              }>{`${formatNumber(activeParticipants)} active participants`}</Text>
          </View>
          <View style={styles.tasksContainer}>
            <ReferFriend code="XID090" />

            <PointsTask
              title="Invest in any strategy"
              subTitle="250 points"
              earned="0"
              type={TaskType.DEFAULT}
            />

            <PointsTask
              title="Invest $1,000 in value"
              subTitle="250 points"
              type={TaskType.PROGRESS}
              progressPercent={30}
              left={'400'}
            />

            <PointsTask
              title="Refer a friend"
              subTitle="250 points"
              link=""
              type={TaskType.BUTTON}
            />

            <Pressable
              onPress={onGoToPointsHistoryScreen}
              style={[styles.row, styles.flexCenter, {marginTop: 40}]}>
              <TimeIcon color={Colors.ui_grey_737} />
              <Text style={styles.greyText}>My points history</Text>
            </Pressable>
            <Pressable
              onPress={onOpenPointsDocs}
              style={[styles.row, styles.flexCenter]}>
              <InfoQuestionIcon
                color={Colors.ui_grey_737}
                width={19}
                height={19}
              />
              <Text style={styles.greyText}>Learn more about points</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  imageBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH + 100,
    height: 554,
    left: -50,
    top: -(initialWindowMetrics?.insets.top || 0),
  },
  coin1Image: {
    position: 'absolute',
    top: 50,
    right: -35,
    width: 100,
    height: 100,
  },
  coin2Image: {
    position: 'absolute',
    top: 120,
    left: -40,
    width: 100,
    height: 100,
  },
  closeIconContainer: {
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
  },
  pointsAmountContainer: {
    alignItems: 'center',
    marginTop: 55,

    paddingTop: 38,
    marginBottom: 38,
  },
  earnText: {
    fontFamily: Fonts.medium,
    fontSize: 24,
    color: Colors.ui_orange_80,
    marginTop: 7,
  },
  participantsText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_beige_60,

    marginTop: 8,
  },
  tasksContainer: {
    gap: 8,
  },
  scroll: {
    paddingHorizontal: 12,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  flexCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  greyText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_737,
  },
});

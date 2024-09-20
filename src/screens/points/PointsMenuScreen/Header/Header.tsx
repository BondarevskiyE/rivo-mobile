import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as RootNavigation from '@/navigation/RootNavigation';
import {useUserStore} from '@/store/useUserStore';
import {CloseIcon} from '@/shared/ui/icons';
import {Colors, Fonts} from '@/shared/ui';
import {DEFAULT_USER_PHOTO} from '@/shared/constants';
import {POINTS_SCREENS} from '@/navigation/types/pointsStack';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export const Header = () => {
  const user = useUserStore(state => state.userInfo);

  const onCloseScreen = () => {
    RootNavigation.navigationRef.goBack();
  };

  const onGoToLeaderboardScreen = () => {
    RootNavigation.navigate(POINTS_SCREENS.LEADERBOARD_SCREEN);
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onCloseScreen} style={styles.closeIconContainer}>
        <CloseIcon width={14} height={14} color={Colors.ui_white} />
      </Pressable>

      <Pressable
        onPress={onGoToLeaderboardScreen}
        style={styles.userRateContainer}>
        <Image
          source={{uri: user?.photo || DEFAULT_USER_PHOTO}}
          style={styles.userPhoto}
        />
        <Text style={styles.userRateText}>#1</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SCREEN_WIDTH - 12 * 2,
    height: 36,
    zIndex: 9,
    left: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ui_black_50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userRateContainer: {
    backgroundColor: Colors.ui_black_50,
    height: 36,
    // width: 90,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 4,
    paddingRight: 9,
    gap: 5,
  },
  userPhoto: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  userRateText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.ui_white,
  },
});

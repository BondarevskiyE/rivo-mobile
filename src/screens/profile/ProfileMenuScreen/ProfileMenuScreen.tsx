import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {initialWindowMetrics} from 'react-native-safe-area-context';

import * as RootNavigation from '@/navigation/RootNavigation';

import {
  PROFILE_SCREENS,
  ProfileStackProps,
} from '@/navigation/types/profileStack';
import {HOME_SCREENS} from '@/navigation/types/homeStack';
import {CloseIcon} from '@/shared/ui/icons/CloseIcon';
import {Colors, Fonts} from '@/shared/ui';
import {useUserStore} from '@/store/useUserStore';
import {DEFAULT_USER_PHOTO} from '@/shared/constants';
import {MenuActionButtons} from '@/components/MenuActionButtons';
import {buttons, links} from './buttonsData';
import {ScrollView} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';

type Props = StackScreenProps<ProfileStackProps, PROFILE_SCREENS.PROFILE_MENU>;

export const ProfileMenuScreen: React.FC<Props> = ({navigation}) => {
  const user = useUserStore(state => state.userInfo);

  const handleGoBack = () => {
    RootNavigation.navigate(HOME_SCREENS.HOME_SCREEN);
  };

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}
      style={styles.gradientContainer}>
      <View style={styles.container}>
        <Pressable onPress={handleGoBack} style={styles.closeIconContainer}>
          <CloseIcon color={Colors.ui_grey_735} />
        </Pressable>
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}>
          <View style={styles.profileContainer}>
            <Image
              source={{uri: user?.photo || DEFAULT_USER_PHOTO}}
              style={styles.photo}
            />
            <Text style={styles.nameText}>{user?.name}</Text>
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>

          <View style={{marginBottom: 12}}>
            <MenuActionButtons buttonsData={buttons} />
          </View>
          <MenuActionButtons buttonsData={links} />
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    paddingTop: initialWindowMetrics?.insets.top,
  },
  container: {
    position: 'relative',
    paddingHorizontal: 12,
  },
  list: {
    paddingBottom: 35,
  },
  profileContainer: {
    marginTop: 58,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 16,
  },
  nameText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_black_55,

    marginBottom: 2,
  },
  emailText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_69,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 7,
    left: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: Colors.ui_grey_06,
    borderRadius: 18,
    zIndex: 2,
  },
});

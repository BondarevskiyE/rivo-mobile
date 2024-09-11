import {StackScreenProps} from '@react-navigation/stack';
import {Pressable, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {initialWindowMetrics} from 'react-native-safe-area-context';

import {
  PROFILE_SCREENS,
  ProfileStackProps,
} from '@/navigation/types/profileStack';
import {Colors} from '@/shared/ui';
import {ArrowLineIcon} from '@/shared/ui/icons';
import {MenuActionButtons} from '@/components/MenuActionButtons';
import {aboutButtons} from './buttonsData';

type Props = StackScreenProps<ProfileStackProps, PROFILE_SCREENS.ABOUT_RIVO>;

export const AboutRivoScreen: React.FC<Props> = ({navigation}) => {
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}
      style={styles.gradientContainer}>
      <View style={styles.container}>
        <Pressable onPress={handleGoBack} style={styles.closeIconContainer}>
          <ArrowLineIcon color={Colors.ui_grey_735} />
        </Pressable>

        <MenuActionButtons buttonsData={aboutButtons} />
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
    paddingTop: 63,
    paddingHorizontal: 12,
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

    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
});

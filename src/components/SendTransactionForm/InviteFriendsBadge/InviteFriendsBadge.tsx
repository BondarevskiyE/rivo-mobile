
import {StyleSheet, View} from 'react-native';

import {ImageBadge} from '@/components/ImageBadge';
import {GradientText} from '@/components/general/GradientText';
import {Fonts, Images} from '@/shared/ui';

export const InviteFriendsBadge = () => {
  return (
    <ImageBadge
      onPress={() => {}}
      image={Images.onboardingTask1}
      style={styles.badge}>
      <View style={styles.container}>
        <GradientText style={styles.text}>
          Invite friends - earn points!
        </GradientText>
      </View>
    </ImageBadge>
  );
};

const styles = StyleSheet.create({
  badge: {
    marginTop: 20,
  },
  container: {
    height: 40,
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
});

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {authSliderData} from '@/shared/config';
import {ConnectButton} from './components/ConnectButton';
import {ExternalLink, Slider} from '@/components';
import {useLoginStore} from '@/store/useLoginStore';
import {Colors, Fonts} from '@/shared/ui';

import {AUTH_SCREENS, AuthStackProps} from '@/navigation/AuthStack';
import {StackScreenProps} from '@react-navigation/stack';

type Props = StackScreenProps<AuthStackProps, AUTH_SCREENS.LOGIN>;

export const LoginScreen: React.FC<Props> = ({navigation}) => {
  const loginGoogle = useLoginStore(state => state.loginGoogle);
  const loginX = useLoginStore(state => state.loginX);

  const authGoogle = async () => {
    const isAuthenticated = await loginGoogle();
    if (isAuthenticated) {
      navigation.navigate(AUTH_SCREENS.CARD_CREATING);
    }
  };

  const authX = async () => {
    const isAuthenticated = await loginX();
    if (isAuthenticated) {
      navigation.navigate(AUTH_SCREENS.CARD_CREATING);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loggingContainer}>
        <Slider data={authSliderData} />
        <View style={styles.lowerBlock}>
          <ConnectButton
            onPress={authGoogle}
            text="Continue with Google"
            icon="google"
          />
          <ConnectButton
            onPress={authX}
            text="Continue with Twitter"
            icon="twitter"
          />
          <Text style={styles.captionText}>
            By continuing you agree to{' '}
            <ExternalLink
              url="https://www.rivo.xyz/terms-of-use"
              style={styles.externalLink}>
              Terms of Use
            </ExternalLink>{' '}
            and{' '}
            <ExternalLink
              url="https://www.rivo.xyz/privacy-notice"
              style={styles.externalLink}>
              Privacy Policy
            </ExternalLink>
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.ui_background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 26,
    paddingBottom: 30,
  },
  titleText: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    textAlign: 'center',
  },
  loggingContainer: {
    height: '100%',
    justifyContent: 'space-between',
  },
  lowerBlock: {
    paddingLeft: 12,
    paddingRight: 12,
  },
  captionText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12, // FIX to 13px
    color: Colors.grey_text,
    lineHeight: 18.2,
    marginTop: 20,
    textAlign: 'center',
  },
  externalLink: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.blue_text,
  },
});

import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {onboardingData} from '@/shared/config';
import {ConnectButton} from './components/ConnectButton';
import {ExternalLink, Slider} from '@/components';
import {LOGIN_STEPS, useLoginStore} from '@/store/useLoginStore';
import {Colors, Fonts} from '@/shared/ui';
import {CardCreating, PassCodeRegistration, EnableNotifications} from './views';

export const LoginScreen = () => {
  const loginGoogle = useLoginStore(state => state.loginGoogle);
  const loginX = useLoginStore(state => state.loginX);

  const loginStep = useLoginStore(state => state.loginStep);
  // const loginStep = LOGIN_STEPS.ENABLE_NOTIFICATIONS;

  if (loginStep === LOGIN_STEPS.CARD_CREATING) {
    return <CardCreating />;
  }

  if (loginStep === LOGIN_STEPS.PASSCODE_REGISTRATION) {
    return <PassCodeRegistration />;
  }

  if (loginStep === LOGIN_STEPS.ENABLE_NOTIFICATIONS) {
    return <EnableNotifications />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.loggingContainer}>
        <Slider data={onboardingData} />
        <View>
          <ConnectButton
            onPress={loginGoogle}
            text="Continue with Google"
            icon="google"
          />
          <ConnectButton
            onPress={loginX}
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
    paddingLeft: 12,
    paddingRight: 12,
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

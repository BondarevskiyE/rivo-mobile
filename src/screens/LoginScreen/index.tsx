import React from 'react';
import {StyleSheet, Text, View, Button} from 'react-native';

import {LOGIN_PROVIDER} from '@web3auth/react-native-sdk';

// Chain
import {useLogin} from '@/shared/hooks';
import {Colors, Fonts} from '@/shared/ui';
import {onboardingData} from '@/shared/config';
import {ConnectButton} from './ui/ConnectButton';
import {ExternalLink, Slider} from '@/shared/ui/components';
import {CardCreating} from '@/widgets/CardCreating';
import {LOGIN_STEPS} from '@/shared/hooks/useLogin';

const LoginScreen = () => {
  const {login, isLoading, step, logout, isLoggedIn, walletAddress} =
    useLogin();

  if (step === LOGIN_STEPS.CARD_CREATING) {
    return <CardCreating isLoading={isLoading} walletAddress={walletAddress} />;
  }

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <View>
          <Button title="Log Out" onPress={logout} />
          <Text style={styles.consoleText}>{`address: ${walletAddress}`}</Text>
        </View>
      ) : (
        <View style={styles.loggingContainer}>
          <Slider data={onboardingData} />
          <View>
            <ConnectButton
              onPress={() => login(LOGIN_PROVIDER.GOOGLE)}
              text="Continue with Google"
              icon="google"
            />
            <ConnectButton
              onPress={() => login(LOGIN_PROVIDER.TWITTER)}
              text="Continue with X"
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
      )}
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
  consoleText: {
    padding: 10,
  },
  titleText: {
    fontSize: 28,
    fontFamily: Fonts.extraBold,
    textAlign: 'center',
  },
  loggingContainer: {
    height: '100%',
    justifyContent: 'space-between',
  },
  captionText: {
    fontFamily: Fonts.extraBold,
    fontSize: 13,
    color: Colors.grey_text,
    lineHeight: 18.2,
    marginTop: 20,
  },
  externalLink: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.blue_text,
  },
});

export default LoginScreen;

import React from 'react';
import {StyleSheet, Text, View, Button} from 'react-native';

import {LOGIN_PROVIDER} from '@web3auth/react-native-sdk';

// Chain
import {useLogin} from '../../hooks';
import {Colors, onboardingData} from '../../constants';
import {ConnectButton} from '../../components/ConnectButton';
import ExternalLink from '../../components/ExternalLink/ExternalLink';
import {Slider} from '../../components/Slider/Slider';

const LoginScreen = () => {
  const {login, logout, isLoggedIn, walletAddress} = useLogin();

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        <View>
          <Button title="Log Out" onPress={logout} />
          <Text style={styles.consoleText}>{`address: ${walletAddress}`}</Text>
        </View>
      ) : (
        <View style={styles.loggingContainer}>
          {/* <Text style={styles.titleText}>
            Welcome to Rivo, a decentralized wallet with built-in yields
          </Text> */}
          {/* <Image
            source={Images.onboardingFirstSlide}
            style={{
              resizeMode: 'contain',

              height: '100%',
            }}
          /> */}
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
    fontFamily: 'Nunito-ExtraBold',
    textAlign: 'center',
  },
  loggingContainer: {
    height: '100%',
    justifyContent: 'space-between',
  },
  captionText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: Colors.grey_text,
    lineHeight: 18.2,
    marginTop: 20,
  },
  externalLink: {
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    color: Colors.blue_text,
  },
});

export default LoginScreen;

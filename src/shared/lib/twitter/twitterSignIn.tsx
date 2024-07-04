import Axios from 'axios';
import OAuth from 'oauth-1.0a';
import {Alert, Linking} from 'react-native';
import Config from 'react-native-config';
import {InAppBrowser} from 'react-native-inappbrowser-reborn';
import crypto from 'react-native-quick-crypto';

import * as RootNavigation from '@/navigation/RootNavigation';
import {getDeepLink} from '../';
import {useUserStore} from '@/store/useUserStore';
import {useLoginStore} from '@/store/useLoginStore';
import {LOGIN_PROVIDER, User} from '@/store/types';
import {AUTH_SCREENS} from '@/navigation/AuthStack';

const CONSUMER_KEY = Config.TWITTER_CONSUMER_KEY;
const CONSUMER_SECRET = Config.TWITTER_CONSUMER_SECRET;
const TWITTER_API = 'https://api.twitter.com';
const OAUTH_CALLBACK_URL = getDeepLink('twitter');

export const signInWithTwitter = async () => {
  const oauth = new OAuth({
    consumer: {
      key: CONSUMER_KEY,
      secret: CONSUMER_SECRET,
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) =>
      crypto.createHmac('sha1', key).update(baseString).digest('base64'),
  });

  const request_data = {
    url: TWITTER_API + '/oauth/request_token',
    method: 'POST',
    data: {
      oauth_callback: OAUTH_CALLBACK_URL,
    },
  };

  try {
    const res = await Axios.post(
      request_data.url,
      {},
      {headers: {...oauth.toHeader(oauth.authorize(request_data))}},
    );
    const responseData = res.data;
    const requestToken = responseData.match(/oauth_token=([^&]+)/)[1];
    const twitterLoginURL =
      TWITTER_API + `/oauth/authenticate?oauth_token=${requestToken}`;
    try {
      if (await InAppBrowser.isAvailable()) {
        const response = await InAppBrowser.openAuth(
          twitterLoginURL,
          OAUTH_CALLBACK_URL,
          {
            // iOS Properties
            ephemeralWebSession: false,
            // Android Properties
            showTitle: false,
            enableUrlBarHiding: true,
            enableDefaultShare: false,
          },
        );

        if (response.type === 'success' && response.url) {
          return handleTwitterSignInResponse(response.url);
        }
      } else {
        Linking.openURL(twitterLoginURL);
      }
    } catch (error) {
      Linking.openURL(twitterLoginURL);
    }
  } catch (error) {
    console.log(`X login error: ${error}`);
  }
};

const handleTwitterSignInResponse = async (url: string) => {
  const params = url.split('?')[1];
  const tokenParts = params.split('&');
  const requestToken = tokenParts[0].split('=')[1];
  const oauthVerifier = tokenParts[1].split('=')[1];

  const oauth = new OAuth({
    consumer: {
      key: CONSUMER_KEY,
      secret: CONSUMER_SECRET,
    },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) =>
      crypto.createHmac('sha1', key).update(baseString).digest('base64'),
  });

  const request_data = {
    url: TWITTER_API + '/oauth/access_token',
    method: 'POST',
    data: {
      oauth_token: requestToken,
      oauth_verifier: oauthVerifier,
    },
  };

  try {
    const res = await Axios.post(
      request_data.url,
      {},
      {headers: {...oauth.toHeader(oauth.authorize(request_data))}},
    );
    const responseData = res.data;

    const authToken = responseData.match(/oauth_token=([^&]+)/)[1];
    const authTokenSecret = responseData.match(/oauth_token_secret=([^&]+)/)[1];

    const user_request = {
      url:
        TWITTER_API + '/1.1/account/verify_credentials.json?include_email=true',
      method: 'GET',
    };

    const userResponse = await Axios.get(user_request.url, {
      headers: {
        ...oauth.toHeader(
          oauth.authorize(user_request, {
            key: authToken,
            secret: authTokenSecret,
          }),
        ),
      },
    });

    const [givenName, familyName] = userResponse.data.name.split(' ');

    const user: Omit<User, 'loginProvider'> = {
      id: userResponse.data.id_str,
      photo: userResponse.data.profile_image_url_https,
      email: userResponse.data.email,
      name: userResponse.data.screen_name,
      familyName,
      givenName,
    };

    return user;
  } catch (error) {
    console.log('Error: twitter access token', error);
  }
};

export const subscribeTwitterListener = () => {
  return Linking.addEventListener('url', async (event: {url: string}) => {
    const url = event.url;

    if (url.includes('twitter')) {
      const user = await handleTwitterSignInResponse(url);

      if (!user) {
        Alert.alert('Error', 'login error');
        return;
      }

      const {setUserInfo, setWalletAddress} = useUserStore.getState();
      const {setIsLoading} = useLoginStore.getState();

      setUserInfo({...user, loginProvider: LOGIN_PROVIDER.TWITTER});

      RootNavigation.navigate(AUTH_SCREENS.CARD_CREATING);

      setTimeout(() => {
        setWalletAddress('0x30713a9895E150D73fB7676D054814d30266F8F1');
      }, 3000); // FIX need address from backend api
      setIsLoading(false);
    }
  });
};

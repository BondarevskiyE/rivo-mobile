import React, {useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import Config from 'react-native-config';

import {
  PROFILE_SCREENS,
  ProfileStackProps,
} from '@/navigation/types/profileStack';
import {Colors} from '@/shared/ui';
import {CloseIcon} from '@/shared/ui/icons';
import {Loader} from '@/components/Loader';

const LIVE_CHAT_LICENSE_ID = Config.LIVE_CHAT_LICENSE_ID;

const webViewLink = `https://secure.livechatinc.com/customer/action/open_chat?license_id=${LIVE_CHAT_LICENSE_ID}`;

type Props = StackScreenProps<
  ProfileStackProps,
  PROFILE_SCREENS.HELP_AND_SUPPORT
>;

export const HelpAndSupportScreen: React.FC<Props> = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.webViewContainer}>
        <Pressable onPress={handleGoBack} style={styles.closeIconContainer}>
          <CloseIcon color={Colors.ui_grey_735} />
        </Pressable>
        <WebView
          source={{
            uri: webViewLink,
          }}
          onLoadEnd={() => setIsLoading(false)}
          setSupportMultipleWindows={false}
          style={styles.webView}
        />
        {isLoading && (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: initialWindowMetrics?.insets.top,
    position: 'relative',

    backgroundColor: Colors.ui_black,
  },
  webViewContainer: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,

    backgroundColor: Colors.ui_white,

    overflow: 'hidden',
  },
  webView: {
    flex: 1,
  },

  loaderContainer: {
    position: 'absolute',
    top: 200,
    width: 400,
    height: 400,
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeIconContainer: {
    position: 'absolute',
    top: 13,
    right: 16,
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

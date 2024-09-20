import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview';
import Config from 'react-native-config';

import {
  PROFILE_SCREENS,
  ProfileStackProps,
} from '@/navigation/types/profileStack';
import {Colors, Fonts} from '@/shared/ui';
import {CloseIcon} from '@/shared/ui/icons';
import {Loader} from '@/components/Loader';
import {
  DragUpFromBottom,
  DragUpFromBottomRefProps,
} from '@/components/panGestureModals';

const INITIAL_TRANSLATE_Y = 600;

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const LIVE_CHAT_LICENSE_ID = Config.LIVE_CHAT_LICENSE_ID;

const webViewLink = `https://secure.livechatinc.com/customer/action/open_chat?license_id=${LIVE_CHAT_LICENSE_ID}&group=8`;

type Props = StackScreenProps<
  ProfileStackProps,
  PROFILE_SCREENS.HELP_AND_SUPPORT_SCREEN
>;

export const HelpAndSupportScreen: React.FC<Props> = ({navigation}) => {
  const [isLoading, setIsLoading] = useState(true);
  const dragBlockRef = useRef<DragUpFromBottomRefProps>(null);

  useEffect(() => {
    setTimeout(() => {
      dragBlockRef?.current?.scrollTo(0);
    }, 200);
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <View style={styles.headerContainer}>
          <Pressable onPress={handleGoBack} style={styles.closeIconContainer}>
            <CloseIcon width={14} height={14} color={Colors.ui_white} />
          </Pressable>
          <Text style={styles.headerText}>Help & Support</Text>
        </View>

        <View style={styles.dragContainer}>
          <DragUpFromBottom
            ref={dragBlockRef}
            initialTranslateY={INITIAL_TRANSLATE_Y}
            translateYOffset={-SCREEN_HEIGHT + 15}
            hideDragLine>
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
          </DragUpFromBottom>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.ui_black,
    zIndex: 2,
    paddingTop: initialWindowMetrics?.insets.top,
  },
  headerContainer: {
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',

    height: 36,
  },
  dragContainer: {
    flex: 1,
    marginTop: 10,
  },
  webView: {
    position: 'relative',
    flex: 1,
    width: '100%',
    height:
      SCREEN_HEIGHT -
      (initialWindowMetrics?.insets.top || 0) -
      (initialWindowMetrics?.insets.bottom || 0) -
      22,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 0,
    left: 18,
    zIndex: 5,

    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ui_black_65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_white,
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
});

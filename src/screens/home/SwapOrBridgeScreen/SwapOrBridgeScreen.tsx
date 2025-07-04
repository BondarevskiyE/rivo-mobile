import React, {useEffect, useRef} from 'react';
import {
  Dimensions,
  Linking,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {WebView, WebViewNavigation} from 'react-native-webview';
import {StackScreenProps} from '@react-navigation/stack';
import {initialWindowMetrics} from 'react-native-safe-area-context';

import {
  DragUpFromBottom,
  DragUpFromBottomRefProps,
} from '@/components/panGestureModals';
import {CloseIcon} from '@/shared/ui/icons';
import {Colors, Fonts} from '@/shared/ui';
import {SwapOrBridgeTutorial} from './SwapOrBridgeTutorial';
import {HomeStackProps, HOME_SCREENS} from '@/navigation/types/homeStack';

const INITIAL_TRANSLATE_Y = 600;

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = StackScreenProps<
  HomeStackProps,
  HOME_SCREENS.SWAP_OR_BRIDGE_SCREEN
>;

export const SwapOrBridgeScreen: React.FC<Props> = ({navigation}) => {
  const dragBlockRef = useRef<DragUpFromBottomRefProps>(null);
  const webViewRef = useRef<WebView>(null);

  const onClose = () => {
    navigation.goBack();
  };

  const navigationRedirect = (navState: WebViewNavigation) => {
    const url = navState.url;

    if (url.includes('app.symbiosis.finance')) {
      if (navState.canGoBack && navState.loading) {
        webViewRef.current?.goBack();
      }
    } else {
      webViewRef.current?.stopLoading();
      webViewRef.current?.goBack();
      Linking.openURL(url);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      dragBlockRef?.current?.scrollTo(0);
    }, 200);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={onClose} style={styles.closeIconContainer}>
            <CloseIcon width={14} height={14} color={Colors.ui_white} />
          </Pressable>
          <Text style={styles.headerText}>Swap or Bridge</Text>
        </View>

        <SwapOrBridgeTutorial />

        <View style={styles.dragContainer}>
          <DragUpFromBottom
            ref={dragBlockRef}
            initialTranslateY={INITIAL_TRANSLATE_Y}
            translateYOffset={-SCREEN_HEIGHT + 260}>
            <WebView
              source={{uri: 'https://app.symbiosis.finance/swap'}}
              automaticallyAdjustContentInsets
              setSupportMultipleWindows={false}
              sharedCookiesEnabled
              thirdPartyCookiesEnabled
              nestedScrollEnabled
              scrollEnabled
              ref={webViewRef}
              onNavigationStateChange={navigationRedirect}
              incognito={true}
              style={styles.webView}
            />
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
    paddingTop: 5,
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
});

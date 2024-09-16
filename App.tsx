import {StatusBar, Platform, UIManager} from 'react-native';
import PolyfillCrypto from 'react-native-webview-crypto';

import Routes from '@/navigation';
import {Colors} from '@/shared/ui';
import {Providers} from '@/Providers';
import Modal from '@/modal-manager';
import {useInitializeApp} from '@/shared/hooks/useInitializeApp';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

export const App = () => {
  useInitializeApp();

  return (
    <Providers>
      <PolyfillCrypto />
      <StatusBar backgroundColor={Colors.ui_background} />
      <Routes />
      <Modal />
    </Providers>
  );
};

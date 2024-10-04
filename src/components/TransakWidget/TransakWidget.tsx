import {useUserStore} from '@/store/useUserStore';
import {
  TransakWebView,
  Environments,
  Events,
  TransakConfig,
  EventTypes,
  Order,
} from '@transak/react-native-sdk';
import {Dimensions, StyleSheet} from 'react-native';
import Config from 'react-native-config';
import {TRANSAK_WIDGET_TYPE} from './types';

const TRANSAK_API_KEY = Config.TRANSAK_API_KEY;

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface Props {
  widgetType: TRANSAK_WIDGET_TYPE;
  widgetHeight?: number;
}

export const TransakWidget: React.FC<Props> = ({
  widgetHeight = SCREEN_HEIGHT,
  widgetType,
}) => {
  const walletAddress = useUserStore(state => state.walletAddress);
  const userInfo = useUserStore(state => state.userInfo);

  const transakConfig: TransakConfig = {
    apiKey: TRANSAK_API_KEY,
    environment: Environments.PRODUCTION,
    partnerOrderId: walletAddress, // Required to receive order events
    productsAvailed: widgetType,
    defaultNetwork: 'arbitrum',
    network: 'arbitrum',
    cryptoCurrencyCode: 'USDC',
    defaultFiatCurrency: 'USD',
    walletAddress,
    email: userInfo?.email,
    userData: {
      firstName: userInfo?.givenName || '',
      lastName: userInfo?.familyName || '',
      email: userInfo?.email || '',
      mobileNumber: '',
      dob: '',
      address: {
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postCode: '',
        countryCode: '',
      },
    },
    isAutoFillUserData: true,
    // hideMenu: true,
    // .....
    // For the full list of query params refer Props section below
  };

  const onTransakEventHandler = (event: EventTypes, data: Order) => {
    switch (event) {
      case Events.ORDER_CREATED:
        console.log(event, data);
        break;

      case Events.ORDER_PROCESSING:
        console.log(event, data);
        break;

      case Events.ORDER_COMPLETED:
        console.log(event, data);
        break;

      default:
        console.log(event, data);
    }
  };

  return (
    <TransakWebView
      transakConfig={transakConfig}
      onTransakEvent={onTransakEventHandler}
      style={[styles.webView, {height: widgetHeight}]}
    />
  );
};

const styles = StyleSheet.create({
  webView: {
    position: 'relative',
    flex: 1,
    width: '100%',
  },
});

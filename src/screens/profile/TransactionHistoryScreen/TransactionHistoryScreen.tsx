import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-gesture-handler';
import {StackScreenProps} from '@react-navigation/stack';

import {Colors, Fonts, Images} from '@/shared/ui';
import {useTransactionsHistoryStore} from '@/store/useTransactionsHistoryStore';
import {createItemsMapByDate} from '@/shared/helpers/mapByDate';
import {Loader} from '@/components/Loader';
import {TxHistoryItemsBlock} from './TxHistoryItemsBlock';
import {CloseIcon} from '@/shared/ui/icons';
import {
  ProfileStackProps,
  PROFILE_SCREENS,
} from '@/navigation/types/profileStack';
import LinearGradient from 'react-native-linear-gradient';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

type Props = StackScreenProps<
  ProfileStackProps,
  PROFILE_SCREENS.TRANSACTION_HISTORY_SCREEN
>;

export const TransactionHistoryScreen: React.FC<Props> = ({navigation}) => {
  const {txHistory, isLoading} = useTransactionsHistoryStore(state => ({
    txHistory: state.txHistory,
    isLoading: state.isLoading,
  }));

  const txHistoryMapByDate = createItemsMapByDate(txHistory, 'time');

  const onClose = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}
      style={styles.gradientContainer}>
      <View style={styles.container}>
        <Pressable style={styles.closeIconContainer} onPress={onClose}>
          <CloseIcon color={Colors.ui_grey_735} />
        </Pressable>
        {txHistory.length ? (
          <ScrollView
            style={{paddingTop: 83}}
            contentContainerStyle={styles.scrollList}
            showsVerticalScrollIndicator={false}>
            {Object.entries(txHistoryMapByDate).map(([date, txs]) => (
              <View key={date}>
                <Text style={styles.dateText}>{date}</Text>
                <TxHistoryItemsBlock txs={txs} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyScreenContainer}>
            <Image
              source={Images.clock}
              style={styles.noTxImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyScreenText}>
              No transaction history here yet. Time to change that - make your
              first deposit
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    paddingTop: initialWindowMetrics?.insets.top,
  },
  container: {
    flex: 1,
    position: 'relative',
    zIndex: 2,
  },
  closeIconContainer: {
    position: 'absolute',
    top: 18,
    left: 18,
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    backgroundColor: Colors.ui_grey_06,
    borderRadius: 18,
    zIndex: 2,
  },
  noTxImage: {
    height: 150,
  },
  emptyScreenContainer: {
    paddingTop: 120,
    alignItems: 'center',
  },
  emptyScreenText: {
    fontFamily: Fonts.regular,
    color: Colors.ui_grey_715,
    textAlign: 'center',
    fontSize: 14,
    marginHorizontal: 60,
    // width: 252,
  },
  scrollListContainer: {
    position: 'relative',
  },
  scrollList: {
    paddingBottom: 90,
    paddingHorizontal: 12,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
    marginLeft: 4,
    marginBottom: 12,
  },
  loadingContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

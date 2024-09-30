import {Dimensions, StyleSheet, Text, View} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {TxHistoryItem} from '@/shared/types/transactionHistory';
import {getTimeString} from '@/shared/helpers/time';
import {DollarIcon, EthereumCircleIcon} from '@/shared/ui/icons';
import {ExpandableCard} from '@/components';
import {LIST_HORIZONTAL_PADDING} from './TransactionHistoryScreen';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface Props {
  txs: TxHistoryItem[];
}

export const TxHistoryItemsBlock: React.FC<Props> = ({txs}) => {
  return (
    <View style={styles.container}>
      {txs.map(tx => {
        const time = getTimeString(tx.time);

        const isPositiveAmount = tx.amount > 0;

        return (
          <ExpandableCard
            initialSize={{
              width: SCREEN_WIDTH - LIST_HORIZONTAL_PADDING * 2,
              height: 72,
              borderRadius: 24,
            }}
            expandedSize={{
              width: SCREEN_WIDTH - LIST_HORIZONTAL_PADDING * 2,
              height: 350,
              borderRadius: 24,
            }}
            duplicateCardWhenExpand
            key={tx.time}>
            <View style={styles.txItemContainer}>
              <View style={{flexDirection: 'row', gap: 8}}>
                {tx.icon === 'eth' ? (
                  <EthereumCircleIcon color={Colors.ui_purple_90} />
                ) : (
                  <DollarIcon color={Colors.ui_green_50} />
                )}
                <View style={{gap: 3}}>
                  <Text style={styles.titleText}>{tx.title}</Text>
                  <Text style={styles.timeText}>{time}</Text>
                </View>
              </View>
              <View style={{alignSelf: 'center'}}>
                <Text
                  style={[
                    styles.amountText,
                    {
                      color: isPositiveAmount
                        ? Colors.ui_green_50
                        : Colors.ui_grey_70,
                    },
                  ]}>{`${isPositiveAmount ? '+' : '-'}$${Math.abs(tx.amount)}`}</Text>
              </View>
            </View>
          </ExpandableCard>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.ui_white,
    borderRadius: 24,
    marginBottom: 40,
  },
  txItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    flex: 1,
    backgroundColor: Colors.ui_white,
  },
  titleText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.ui_black_80,
  },
  timeText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_grey_70,
  },
  amountText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
});

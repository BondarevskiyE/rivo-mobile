import {Dimensions, StyleSheet, View} from 'react-native';

import {Colors} from '@/shared/ui';
import {TxHistoryTransaction} from '@/shared/types/transactionHistory';
import {TxHistoryItem} from './TxHistoryItem';
import {ExpandableCard} from '@/components';
import {LIST_HORIZONTAL_PADDING} from '../constants';

interface Props {
  txs: TxHistoryTransaction[];
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export const TxHistoryItemsBlock: React.FC<Props> = ({txs}) => {
  return (
    <View style={[styles.container]}>
      {txs.map(tx => (
        <ExpandableCard
          expandTime={240}
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
          <TxHistoryItem tx={tx} key={tx.time} />
        </ExpandableCard>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.ui_white,
    borderRadius: 24,
    marginBottom: 40,
  },
});

import {StyleSheet, View} from 'react-native';

import {ActionMenuButton} from './types';
import {ActionButton} from './ActionButton';

interface Props {
  buttonsData: ActionMenuButton[];
}

export const MenuActionButtons: React.FC<Props> = ({buttonsData}) => {
  return (
    <View style={styles.container}>
      {buttonsData.map((button, index) => {
        const isLastItem = index === buttonsData.length - 1;

        return (
          <ActionButton
            button={button}
            isLastItem={isLastItem}
            key={button.title?.toString()}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 24,
  },
});

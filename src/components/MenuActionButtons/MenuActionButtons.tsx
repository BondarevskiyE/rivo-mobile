import {StyleSheet, View} from 'react-native';

import {ActionMenuButton, ButtonType} from './types';
import {ActionButton} from './ActionButton';

interface Props {
  buttonsData: ActionMenuButton<ButtonType>[];
}

export const MenuActionButtons: React.FC<Props> = ({buttonsData}) => {
  return (
    <View style={styles.container}>
      {buttonsData.map((button, index) => {
        const isLastItem = index === buttonsData.length - 1;

        return (
          <ActionButton
            Icon={button.Icon}
            title={button.title}
            type={button.type}
            action={button.action}
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

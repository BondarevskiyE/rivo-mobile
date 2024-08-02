import React, {useRef} from 'react';
import {View, TouchableWithoutFeedback, StyleSheet} from 'react-native';

interface Props {
  selectCard: (px: number, py: number, id: number) => void;
  id: number;
}

export const Card: React.FC<Props> = ({selectCard, id}) => {
  const ref = useRef<View>(null);

  return (
    <View ref={ref}>
      <TouchableWithoutFeedback
        onPress={() =>
          ref?.current?.measureInWindow((x, y) => {
            selectCard(x, y, id);
          })
        }>
        <View style={styles.card} />
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 200,
    width: 200,
    borderRadius: 3,
    backgroundColor: '#5cdb95',
    marginBottom: 20,
  },
});

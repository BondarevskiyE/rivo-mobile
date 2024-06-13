import React from 'react';
import {View, StyleSheet} from 'react-native';

interface Props {
  data: string[];
}

export const Pagination: React.FC<Props> = ({data}) => {
  return (
    <View>
      {data.map((_, idx) => {
        return <View key={idx} style={styles.dot} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  dot: {},
});

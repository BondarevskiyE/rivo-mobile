import {DEFAULT_USER_PHOTO} from '@/shared/constants';
import {useUserStore} from '@/store/useUserStore';
import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {PointsCounter} from '@/components/PointsCounter';

export const Header = () => {
  const user = useUserStore(state => state.userInfo);

  return (
    <View style={styles.container}>
      <Image
        source={{uri: user?.photo || DEFAULT_USER_PHOTO}}
        style={styles.photo}
      />
      <PointsCounter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  photo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

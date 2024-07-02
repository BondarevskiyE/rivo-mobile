import {DEFAULT_USER_PHOTO} from '@/shared/constants';
import {useUserStore} from '@/store/useUserStore';
import React from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {PointsCounter} from '@/components/PointsCounter';
import {Colors} from '@/shared/ui';

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
    paddingTop: 7,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
    borderStartColor: Colors.ui_beige_30,
  },
  photo: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});

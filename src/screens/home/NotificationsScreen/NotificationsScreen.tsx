import {useLoginStore} from '@/store/useLoginStore';

import {Button, StyleSheet, Text, View} from 'react-native';

export function NotificationsScreen() {
  const logout = useLoginStore(state => state.logout);

  return (
    <View style={styles.container}>
      <Text>Notifications!</Text>
      <Button title="Log Out" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

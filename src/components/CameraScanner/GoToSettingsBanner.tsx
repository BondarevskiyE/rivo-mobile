
import {StyleSheet, Text, View} from 'react-native';

import {Colors, Fonts} from '@/shared/ui';
import {ScanIcon} from '@/shared/ui/icons/ScanIcon';
import {Button} from '../general';
import {goToSettings} from '@/shared/helpers/linking';
import {BUTTON_TYPE} from '../general/Button/Button';

export const GoToSettingsBanner = () => {
  return (
    <View style={styles.container}>
      <View>
        <ScanIcon style={styles.scanIcon} width={40} height={40} />
        <Text style={styles.text}>
          To scan QR codes allow Rivo access to camera in settings
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          text="Open settings"
          onPress={goToSettings}
          type={BUTTON_TYPE.ACTION_SECONDARY}
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: Colors.ui_brown_40,

    justifyContent: 'space-between',
  },
  scanIcon: {
    alignSelf: 'center',
    marginTop: 39,
  },
  text: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.ui_orange_79,
    textAlign: 'center',
    paddingHorizontal: 11,
    marginTop: 16,
  },
  buttonContainer: {
    paddingHorizontal: 18,
    marginBottom: 21,
  },
  button: {
    height: 56,
    borderRadius: 28,
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
  },
});

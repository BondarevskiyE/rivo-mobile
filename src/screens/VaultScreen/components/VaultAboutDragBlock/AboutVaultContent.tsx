import {Button} from '@/components';
import {CollapsableText} from '@/components/CollapsableText';
import {BUTTON_TYPE} from '@/components/general/Button/Button';
import {Strategy} from '@/shared/types';
import {Colors, Fonts, Images} from '@/shared/ui';
import React from 'react';
import {StyleSheet, Text, View, Image, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  vault: Strategy;
}

export const AboutVaultContent: React.FC<Props> = ({vault}) => {
  return (
    <LinearGradient
      style={{flex: 1, borderRadius: 10}}
      colors={['rgba(255, 255, 255, 1)', 'rgba(238, 231, 231, 1)']}>
      <View style={styles.container}>
        <Text style={styles.title}>About strategy</Text>
        <CollapsableText
          text={vault.description}
          fontSize={16}
          linePadding={9}
          minLines={3}
        />
        <Image source={Images.storiesMock} />

        <View style={styles.buttonContainer}>
          <Button
            text="Invest"
            style={styles.investButton}
            textStyle={styles.investButtonText}
            type={BUTTON_TYPE.ACTION_SECONDARY}
            onPress={() => Alert.alert('invest!')}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '90%',
    paddingTop: 10,
    paddingHorizontal: 12,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Colors.ui_black_80,

    marginBottom: 12,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  investButton: {
    height: 56,
    borderRadius: 28,
  },
  investButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 17,
  },
});

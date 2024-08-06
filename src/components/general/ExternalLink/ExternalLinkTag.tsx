import {Colors, Fonts} from '@/shared/ui';
import {DiogonalArrowIcon} from '@/shared/ui/icons';
import React from 'react';
import {
  StyleSheet,
  Text,
  Linking,
  TextStyle,
  StyleProp,
  Pressable,
  Image,
} from 'react-native';

interface Props {
  url: string;
  iconUrl: string;
  children: string | JSX.Element | JSX.Element[];
  style?: StyleProp<TextStyle>;
}

export const ExternalLinkTag: React.FC<Props> = ({
  url,
  iconUrl,
  children,
  style = {},
}) => {
  const onPress = () =>
    Linking.canOpenURL(url).then(() => {
      Linking.openURL(url);
    });

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Image source={{uri: iconUrl}} resizeMode="contain" />
      <Text style={[styles.text, style]}>{children}</Text>
      <DiogonalArrowIcon />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 6,
    paddingRight: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderStyle: 'dashed',

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontFamily: Fonts.medium,
    color: Colors.ui_grey_70,
    fontSize: 14,
  },
});

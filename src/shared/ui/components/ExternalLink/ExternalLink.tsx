import React from 'react';
import {StyleSheet, Text, Linking, TextStyle, StyleProp} from 'react-native';

interface Props {
  url: string;
  children: string | JSX.Element | JSX.Element[];
  style?: StyleProp<TextStyle>;
}

export const ExternalLink: React.FC<Props> = ({url, children, style = {}}) => {
  const onPress = () =>
    Linking.canOpenURL(url).then(() => {
      Linking.openURL(url);
    });

  return (
    <Text onPress={onPress} style={[styles.text, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
  },
});

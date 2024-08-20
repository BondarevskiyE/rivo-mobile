import React from 'react';
import {StyleProp, Text, TextStyle} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import {withChildren} from '@/shared/types';

type Props = {
  style?: StyleProp<TextStyle>;
  gradientColors?: [string, string];
} & withChildren;

export const GradientText = (props: Props) => {
  const gradientColors = props.gradientColors || [
    '#FFFFFF',
    'rgba(255, 255, 255, 0.7) ',
  ];

  return (
    <MaskedView maskElement={<Text {...props} />}>
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}>
        <Text {...props} style={[props.style, {opacity: 0}]} />
      </LinearGradient>
    </MaskedView>
  );
};

import {Platform} from 'react-native';

interface Params {
  xOffset: number;
  yOffset: number;
  shadowColorIos: string;
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
  shadowColorAndroid: string;
}

export const generateBoxShadowStyle = ({
  xOffset,
  yOffset,
  shadowColorIos,
  shadowOpacity,
  shadowRadius,
  elevation,
  shadowColorAndroid,
}: Params) => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: shadowColorIos,
      shadowOffset: {width: xOffset, height: yOffset},
      shadowOpacity,
      shadowRadius,
    };
  } else if (Platform.OS === 'android') {
    return {
      elevation,
      shadowColor: shadowColorAndroid,
    };
  }
};

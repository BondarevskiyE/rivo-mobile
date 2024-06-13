import {Dimensions, StatusBar} from 'react-native';

export {data as onboardingData} from './onboardingData';

export const bottombarHeight =
  Dimensions.get('screen').height == Dimensions.get('window').height
    ? Dimensions.get('screen').height -
      Dimensions.get('window').height +
      (StatusBar.currentHeight || 0)
    : StatusBar.currentHeight;

export const Colors = {
  //UI Neutrals
  ui_white: '#FFF',
  ui_grey_05: '#F2F2F2',
  grey_text: '#838A91',
  blue_text: '#3B60E1',

  // background
  ui_light_selected_bg: '#E7F5FF',
  ui_background: '#ededed',

  // button
  ui_dark_blue: '#252E4C',
};
export const Fonts = {
  regular: 'Montserrat-Regular', // Font File Name Must Match To Use Custom Font
  light: 'Montserrat-Light',
  medium: 'Montserrat-Medium',
  bold: 'Montserrat-Regular',
};

export const Images = {
  onboardingFirstSlide: require('../../assets/images/onboarding-first-slide.png'),
  onboardingSecondSlide: require('../../assets/images/onboarding-second-slide.png'),
};

export const Icons = {};

import {Dimensions, StatusBar} from 'react-native';
// import {generateBoxShadowStyle} from '../lib';

export const bottombarHeight =
  Dimensions.get('screen').height === Dimensions.get('window').height
    ? Dimensions.get('screen').height -
      Dimensions.get('window').height +
      (StatusBar.currentHeight || 0)
    : StatusBar.currentHeight;

export const Colors = {
  //UI Neutrals
  ui_white: '#FFF',
  ui_grey_05: '#F2F2F2',
  ui_grey_10: '#DBDBDB',
  ui_grey_15: '#D3CFCC',
  ui_grey_20: '#CECCCA',
  ui_gray_50: '#373737',
  grey_text: '#838A91',
  blue_text: '#3B60E1',
  error_red: '#D93232',

  ui_black: '#000000',

  // background
  ui_light_selected_bg: '#E7F5FF',
  ui_background: '#ededed',

  // button
  ui_dark_blue: '#252E4C',
};
export const Fonts = {
  light: 'Nunito-Light',
  regular: 'Nunito-Regular',
  medium: 'Nunito-Medium',
  bold: 'Nunito-Bold',
  extraBold: 'Nunito-ExtraBold',
};

export const Shadows = {
  innerText: {
    textShadowColor: '#00000040',
    textShadowOffset: {
      width: 1,
      height: -0.4,
    },
    textShadowRadius: -4.4,
  },
};

export const Images = {
  onboardingFirstSlide: require('../../../assets/images/onboarding-first-slide.png'),
  onboardingSecondSlide: require('../../../assets/images/onboarding-second-slide.png'),
  cardCat: require('../../../assets/images/card-cat.png'),
  cardCatOrange: require('../../../assets/images/card-cat-orange.png'),
};

export const Icons = {};

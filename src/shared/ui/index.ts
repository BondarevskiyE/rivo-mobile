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
  ui_grey_13: '#d9d9d9',
  ui_grey_15: '#D3CFCC',
  ui_grey_20: '#CECCCA',

  ui_grey_65: '#8d8d8d',
  ui_grey_70: '#888888',

  ui_grey_75: '#4d4d4d',
  ui_grey_80: '#494949',
  ui_grey_90: '#373737',

  grey_text: '#838A91',
  blue_text: '#3B60E1',
  error_red: '#D93232',

  ui_beige_20: '#EEE7E7',
  ui_beige_30: '#eae2dd',
  ui_beige_50: '#e9c7b4',

  ui_orange_20: '#feefe5',
  ui_orange_25: '#f9e8df',
  ui_orange_40: '#C17830',
  ui_orange_45: '#AB6927',
  ui_orange_70: '#FA8112',
  ui_orange_80: '#F95E00',

  ui_green_50: '#5CB924',

  ui_purple_50: '#2A254C',

  ui_black_70: '#1C1C1C',
  ui_black_80: '#111111',
  ui_black: '#000000',
  transparent: 'transparent',

  // background
  ui_light_selected_bg: '#E7F5FF',
  ui_background: '#ededed',

  // button
  ui_dark_blue: '#252E4C',
};
export const Fonts = {
  regular: 'OpenRunde-Regular',
  medium: 'OpenRunde-Medium',
  semiBold: 'OpenRunde-Semibold',
  bold: 'OpenRunde-Bold',
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
  authFirstSlide: require('../../../assets/images/auth-slider/first-slide.png'),
  authSecondSlide: require('../../../assets/images/auth-slider/second-slide.png'),

  cardCat: require('../../../assets/images/card/card-cat.png'),
  cardCatOrange: require('../../../assets/images/card/card-cat-orange.png'),
  enableNotifications: require('../../../assets/images/enable-notifications.png'),
  userCard: require('../../../assets/images/card/user-card.png'),

  onboardingTask1: require('../../../assets/images/onboarding/task-mountains.png'),
  onboardingTask2: require('../../../assets/images/onboarding/task-sea.png'),
  onboardingTask3: require('../../../assets/images/onboarding/task-japan.png'),
  onboardingCat: require('../../../assets/images/onboarding/onboarding-cat.png'),

  cardVariantCat: require('../../../assets/images/card/variants/cat.png'),
  cardVariantCarp: require('../../../assets/images/card/variants/carp.png'),
};

export const Icons = {};

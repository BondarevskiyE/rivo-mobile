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
  ui_grey_02: '#fafafa',
  ui_grey_03: '#ececec',
  ui_grey_04: '#f1eeef',
  ui_grey_05: '#F2F2F2',
  ui_grey_06: '#f5f5f5',
  ui_grey_065: '#ebedef',
  ui_grey_07: '#d7d9dd',
  ui_grey_10: '#DBDBDB',
  ui_grey_13: '#d9d9d9',

  ui_grey_15: '#D3CFCC',
  ui_grey_20: '#CECCCA',
  ui_grey_25: '#c1c5cb',
  ui_grey_40: '#b8b8b8',
  ui_grey_42: '#ababab',
  ui_grey_43: '#acacac',

  ui_grey_50: '#867f7b',
  ui_grey_55: '#848a94',
  ui_grey_57: '#838a91',
  ui_grey_60: '#989898',

  ui_grey_65: '#8d8d8d',
  ui_grey_69: '#878380',

  ui_grey_70: '#888888',
  ui_grey_715: '#838081',

  ui_grey_71: '#808080',

  ui_grey_72: '#7b7e79',

  ui_grey_73: '#8c8c8c',

  ui_grey_735: '#828282',
  ui_grey_737: '#7a7a7a',

  ui_grey_739: '#767676',

  ui_grey_74: '#747474',
  ui_grey_75: '#4d4d4d',
  ui_grey_80: '#494949',

  ui_grey_82: '#434343',
  ui_gray_83: '#474747',
  ui_grey_90: '#373737',
  ui_grey_95: '#313131',
  ui_grey_97: '#2c2c2c',
  ui_grey_98: '#191919',
  ui_grey_99: '#212121',

  grey_text: '#838A91',
  blue_text: '#3B60E1',
  error_red: '#D93232',

  ui_beige_10: '#f7f3f2',
  ui_beige_20: '#EEE7E7',
  ui_beige_30: '#eae2dd',
  ui_beige_50: '#e9c7b4',
  ui_beige_60: '#b19c91',
  ui_beige_61: '#9d928a',

  ui_orange_20: '#feefe5',
  ui_orange_22: '#fcf0e0',
  ui_orange_25: '#f9e8df',
  ui_orange_40: '#C17830',
  ui_orange_45: '#AB6927',
  ui_orange_60: '#FAA51C',
  ui_orange_70: '#FA8112',
  ui_orange_79: '#f96104',
  ui_orange_80: '#F95E00',

  ui_red_40: '#330900',
  ui_red_80: '#fc2b00',
  ui_red_83: '#fa3002',

  ui_brown_20: '#2f2015',
  ui_brown_40: '#201106',
  ui_brown_50: '#302116',
  ui_brown_90: '#190a00',

  ui_green_10: '#e4f7e4',
  ui_green_40: '#6CCF30',
  ui_green_45: '#6BCD30',
  ui_green_46: '#6dca35',
  ui_green_50: '#5CB924',
  ui_green_51: '#51ab1b',
  ui_green_52: '#50C750',
  ui_green_55: '#28b91d',
  ui_green_70: '#1EC31A',
  ui_green_75: '#2CDB1D',

  ui_green_80: '#202a1a',
  ui_green_90: '#1d2717',

  ui_purple_10: '#f4ecfe',
  ui_purple_50: '#b97afa',
  ui_purple_90: '#2A254C',

  ui_black_50: '#312522',
  ui_black_55: '#222222',
  ui_black_60: '#232323',
  ui_black_63: '#1e222e',
  ui_black_64: '#1d1b19',
  ui_black_65: '#1a1a1a',
  ui_black_70: '#1C1C1C',
  ui_black_75: '#101010',
  ui_black_80: '#111111',
  ui_black_90: '#080808',
  ui_black: '#000000',

  ui_blue_10: '#eaf2fe',
  ui_blue_50: '#68a4ed',

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
  onboardingSlide1: require('../../../assets/images/onboarding/onboarding-slide-1.png'),
  onboardingSlide2: require('../../../assets/images/onboarding/onboarding-slide-2.png'),
  onboardingSlide3: require('../../../assets/images/onboarding/onboarding-slide-3.png'),
  onboardingSlide4: require('../../../assets/images/onboarding/onboarding-slide-4.png'),

  cardVariantCat: require('../../../assets/images/card/variants/cat.png'),
  cardVariantCarp: require('../../../assets/images/card/variants/carp.png'),

  chartNet: require('../../../assets/images/chart/chart-net.png'),

  vaultInfoMock: require('../../../assets/images/vaultInfoMock.png'),

  stars: require('../../../assets/images/stars.png'),
  heart: require('../../../assets/images/heart.png'),
  services: require('../../../assets/images/services.png'),

  checkShield: require('../../../assets/images/risk-score/check-shield.png'),
  userDialog: require('../../../assets/images/risk-score/user-dialog.png'),
  star: require('../../../assets/images/risk-score/star.png'),
  brilliant: require('../../../assets/images/risk-score/brilliant.png'),

  fivePercent: require('../../../assets/images/fee-structure/five-percent.png'),
  tenPercent: require('../../../assets/images/fee-structure/ten-percent.png'),

  qrLogo: require('../../../assets/images/qr-logo.png'),

  swapOrBridgeTutorial1: require('../../../assets/images/swap-or-bridge-tutorial/slide1.png'),
  swapOrBridgeTutorial2: require('../../../assets/images/swap-or-bridge-tutorial/slide2.png'),
  swapOrBridgeTutorial3: require('../../../assets/images/swap-or-bridge-tutorial/slide3.png'),
  swapOrBridgeTutorial4: require('../../../assets/images/swap-or-bridge-tutorial/slide4.png'),

  pointsScreenBackground: require('../../../assets/images/points-screen/points_screen_background.png'),
  coin1: require('../../../assets/images/points-screen/coin_1.png'),
  coin2: require('../../../assets/images/points-screen/coin_2.png'),
  pointsStar: require('../../../assets/images/points-screen/star.png'),

  pointsMaskBackground: require('../../../assets/images/points-screen/points_amount_mask.png'),
  referFriendMask: require('../../../assets/images/points-screen/refer_friend_mask.png'),
  pointsPedestal: require('../../../assets/images/points-screen/points_pedestal.png'),
  pointsLeaderboardBg: require('../../../assets/images/points-screen/leaderboard-bg.png'),
  noPointsHistoryBg: require('../../../assets/images/points-screen/no_points_history_bg.png'),

  clock: require('../../../assets/images/profile-screen/time-clock.png'),
};

export const Videos = {
  etherBackground: require('assets/videos/ether-video.mp4'),
};

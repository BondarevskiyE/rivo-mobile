import {Dimensions} from 'react-native';

const {height: SCREEN_HEIGHT, width: SCREEN_WIDTH} = Dimensions.get('window');

export const isSmallScreenDeviceHeight = SCREEN_HEIGHT < 700;
export const isSmallScreenDeviceWidth = SCREEN_WIDTH <= 375;

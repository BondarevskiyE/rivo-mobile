import {Dimensions} from 'react-native';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

export const isSmallScreenDevice = SCREEN_HEIGHT < 750;

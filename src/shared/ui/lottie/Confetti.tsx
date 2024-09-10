
import LottieView from 'lottie-react-native';
import {LottieProps} from './types';

const path = require('../../../../assets/lottie-animations/confetti.json');

export const ConfettiAnimation = ({
  autoPlay = true,
  loop = true,
}: LottieProps) => {
  return (
    <LottieView
      source={path}
      style={{width: '100%', height: '100%'}}
      autoPlay={autoPlay}
      loop={loop}
    />
  );
};

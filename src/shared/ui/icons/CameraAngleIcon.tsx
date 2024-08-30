import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const CameraAngleIcon = (props: SvgProps) => (
  <Svg
    width={71}
    height={71}
    viewBox="0 0 71 71"
    fill="none"
    color="#F95E00"
    {...props}>
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={6}
      d="M3 68v-1c0-22.402 0-33.603 4.36-42.16A40 40 0 0 1 24.84 7.36C33.397 3 44.598 3 67 3h1"
    />
  </Svg>
);

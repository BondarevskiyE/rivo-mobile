import * as React from 'react';
import Svg, {
  SvgProps,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export const GradientBellIcon = (props: SvgProps) => (
  <Svg width={58} height={69} viewBox="0 0 58 69" fill="none" {...props}>
    <Path
      fill="url(#a)"
      d="M29.005 68.75c-5.924 0-10.5-3.063-10.5-8.75h21c0 5.688-4.576 8.75-10.5 8.75Zm20.979-27.266c0 6 7.516 7.5 7.516 10.5s-1.5 4.5-7.5 4.5H8c-6 0-7.5-1.5-7.5-4.5s7.5-4.5 7.5-10.5v-10.5C8 15.984 14 3.5 26 3.5c0-2.25 1.5-3 3-3s3 .75 3 3c12 0 17.984 12.484 17.984 27.484v10.5Z"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={29}
        x2={29}
        y1={0.5}
        y2={68.75}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#dedcdc" />
        <Stop offset={1} stopColor="#f6f4f4" />
      </LinearGradient>
    </Defs>
  </Svg>
);

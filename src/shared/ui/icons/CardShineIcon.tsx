import * as React from 'react';
import Svg, {
  SvgProps,
  G,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export const CardShineIcon = (props: SvgProps) => (
  <Svg width={233} height={334} fill="none" {...props}>
    <G filter="url(#a)" opacity={0.7}>
      <Path
        fill="url(#b)"
        d="M58.328 12h164.8v286.309h-164.8z"
        transform="rotate(9.312 58.328 12)"
      />
    </G>
    <Defs>
      <LinearGradient
        id="b"
        x1={118.356}
        x2={236.489}
        y1={78.144}
        y2={68.144}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#fff" stopOpacity={0} />
        <Stop offset={0.5} stopColor="#fff" stopOpacity={0.3} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0} />
      </LinearGradient>
    </Defs>
  </Svg>
);

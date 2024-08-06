import * as React from 'react';
import Svg, {
  SvgProps,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export const RiskScoreCounterIcon = (props: SvgProps) => (
  <Svg width={211} height={117} fill="none" {...props}>
    <Path
      stroke="url(#a)"
      strokeLinecap="round"
      strokeWidth={6}
      d="M193.063 52.219A102.495 102.495 0 0 1 208 105.5"
    />
    <Path
      stroke="url(#b)"
      strokeLinecap="round"
      strokeWidth={6}
      d="M141.927 9.691a102.5 102.5 0 0 1 44.495 32.897"
    />
    <Path
      stroke="url(#c)"
      strokeLinecap="round"
      strokeWidth={6}
      d="M3.01 106.982A102.5 102.5 0 0 1 17.176 53.49"
    />
    <Path
      stroke="url(#d)"
      strokeLinecap="round"
      strokeWidth={6}
      d="M23.334 44.222A102.5 102.5 0 0 1 67.161 10.44"
    />
    <Path
      stroke="url(#e)"
      strokeLinecap="round"
      strokeWidth={6}
      d="M77.91 6.783a102.5 102.5 0 0 1 55.335.044"
    />
    <Defs>
      <LinearGradient
        id="a"
        x1={192}
        x2={193.5}
        y1={49}
        y2={114.5}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#C0D541" />
        <Stop offset={1} stopColor="#66CB26" />
      </LinearGradient>
      <LinearGradient
        id="b"
        x1={188.5}
        x2={140}
        y1={45}
        y2={8.5}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#C0D541" />
        <Stop offset={1} stopColor="#FEA219" />
      </LinearGradient>
      <LinearGradient
        id="c"
        x1={18.5}
        x2={4}
        y1={51.5}
        y2={120.5}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#CA3F46" />
        <Stop offset={1} stopColor="#F20D18" />
      </LinearGradient>
      <LinearGradient
        id="d"
        x1={69}
        x2={21.5}
        y1={9.5}
        y2={47}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#F26D0C" />
        <Stop offset={1} stopColor="#CA3F46" />
      </LinearGradient>
      <LinearGradient
        id="e"
        x1={134}
        x2={76}
        y1={7}
        y2={7}
        gradientUnits="userSpaceOnUse">
        <Stop stopColor="#FEA219" />
        <Stop offset={1} stopColor="#F26D0C" />
      </LinearGradient>
    </Defs>
  </Svg>
);

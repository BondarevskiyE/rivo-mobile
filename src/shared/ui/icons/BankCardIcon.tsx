import * as React from 'react';
import Svg, {
  SvgProps,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export const BankCardIcon = (props: SvgProps) => {
  const color = props?.color || '#50C750';
  return (
    <Svg
      width={18}
      height={14}
      viewBox="0 0 18 14"
      fill="none"
      color={color}
      {...props}>
      <Path
        fill="url(#a)"
        d="M.25 3.875c0-.58 0-.871.048-1.113A2.5 2.5 0 0 1 2.262.798C2.504.75 2.794.75 3.375.75h11.25c.58 0 .871 0 1.113.048a2.5 2.5 0 0 1 1.964 1.964c.048.242.048.532.048 1.113H.25Z"
      />
      <Path
        fill="url(#b)"
        fillRule="evenodd"
        d="M17.75 5.75H.25v3.5c0 1.4 0 2.1.272 2.635a2.5 2.5 0 0 0 1.093 1.092c.535.273 1.235.273 2.635.273h9.5c1.4 0 2.1 0 2.635-.273a2.5 2.5 0 0 0 1.092-1.092c.273-.535.273-1.235.273-2.635v-3.5ZM3.375 8.25a.625.625 0 0 0-.625.625v1.25c0 .345.28.625.625.625H5.25c.345 0 .625-.28.625-.625v-1.25a.625.625 0 0 0-.625-.625H3.375Z"
        clipRule="evenodd"
      />
      <Defs>
        <LinearGradient
          id="a"
          x1={-8.5}
          x2={3.324}
          y1={7}
          y2={23.554}
          gradientUnits="userSpaceOnUse">
          <Stop stopColor={color} />
          <Stop offset={1} stopColor={color} />
        </LinearGradient>
        <LinearGradient
          id="b"
          x1={-8.5}
          x2={3.324}
          y1={7}
          y2={23.554}
          gradientUnits="userSpaceOnUse">
          <Stop stopColor={color} />
          <Stop offset={1} stopColor={color} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

import * as React from 'react';
import Svg, {
  SvgProps,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export const PaperPlaneIcon = (props: SvgProps) => {
  const color = props?.color || '#70B2FF';
  return (
    <Svg
      width={16}
      height={17}
      viewBox="0 0 16 17"
      fill="none"
      color={color}
      {...props}>
      <Path
        fill="url(#a)"
        d="M8.615 11.763c.647 1.418 1.13 2.385 1.45 2.902 1 1.623 1.07 2.144 1.604.363.534-1.78 3.048-10.474 3.611-12.41C16.015.093 16.106.14 13.417.93c-2.048.6-10.594 3.129-12.247 3.6-1.652.47-1.26.603.364 1.605.523.323 1.5.809 2.932 1.457a3.143 3.143 0 0 0 3.061-.261L11.4 4.705a.079.079 0 0 1 .11.109L8.873 8.693a3.143 3.143 0 0 0-.259 3.07Z"
      />
      <Defs>
        <LinearGradient
          id="a"
          x1={0.505}
          x2={21.622}
          y1={15.708}
          y2={14.703}
          gradientUnits="userSpaceOnUse">
          <Stop stopColor={color} />
          <Stop offset={1} stopColor={color} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

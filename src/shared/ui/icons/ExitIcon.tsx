import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const ExitIcon = (props: SvgProps) => (
  <Svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    color="#84868D"
    {...props}>
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13.333 21.334v1.6c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748c.856.436 1.976.436 4.216.436h3.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748c.436-.856.436-1.976.436-4.216V9.067c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748c-.856-.436-1.976-.436-4.216-.436h-3.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748c-.436.856-.436 1.976-.436 4.216v1.6M20 16H2.666m0 0L8 10.667M2.666 16 8 21.333"
    />
  </Svg>
);

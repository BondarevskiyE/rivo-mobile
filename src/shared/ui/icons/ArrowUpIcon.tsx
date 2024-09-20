import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const ArrowUpIcon = (props: SvgProps) => (
  <Svg
    width={11}
    height={11}
    viewBox="0 0 11 11"
    color={'#111'}
    fill="none"
    {...props}>
    <Path
      fill="currentColor"
      fillOpacity={0.5}
      d="M4.683 3.158a1 1 0 0 1 1.634 0l2.834 4.015a1 1 0 0 1-.817 1.577H2.666a1 1 0 0 1-.817-1.577l2.834-4.015Z"
    />
  </Svg>
);

import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const CheckIcon = (props: SvgProps) => (
  <Svg
    width={19}
    height={14}
    viewBox="0 0 19 14"
    fill="none"
    color="#fff"
    {...props}>
    <Path
      fill="currentColor"
      d="M16.864.364a.9.9 0 0 1 1.272 1.272l-11.5 11.5a.9.9 0 0 1-1.272 0l-5-5a.9.9 0 1 1 1.272-1.272L6 11.227 16.864.364Z"
    />
  </Svg>
);

import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const XIcon = (props: SvgProps) => (
  <Svg
    width={14}
    height={14}
    viewBox="0 0 14 14"
    fill="none"
    color="#838A91"
    {...props}>
    <Path
      fill="currentColor"
      d="M8.333 5.929 13.546 0H12.31L7.783 5.147 4.169 0H0l5.466 7.783L0 14h1.235l4.779-5.436L9.83 14H14L8.333 5.929Z"
    />
  </Svg>
);

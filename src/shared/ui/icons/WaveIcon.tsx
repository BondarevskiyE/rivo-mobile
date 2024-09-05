import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const WaveIcon = (props: SvgProps) => (
  <Svg
    width={343}
    height={19}
    viewBox="0 0 343 19"
    fill="none"
    color="#fff"
    {...props}>
    <Path
      stroke="currentColor"
      strokeLinecap="round"
      strokeOpacity={0.2}
      strokeWidth={2.4}
      d="m2 2 21.188 10.5a47.715 47.715 0 0 0 42.374 0v0a47.716 47.716 0 0 1 42.376 0v0a47.713 47.713 0 0 0 42.374 0v0a47.718 47.718 0 0 1 42.376 0v0a47.713 47.713 0 0 0 42.374 0v0a47.718 47.718 0 0 1 42.376 0v0a47.713 47.713 0 0 0 42.374 0L341 2"
    />
  </Svg>
);

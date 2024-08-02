import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const ArrowLineIcon = (props: SvgProps) => (
  <Svg width={7} height={12} viewBox="0 0 7 12" fill="none" {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M.264.264a.9.9 0 0 0 0 1.272L4.727 6 .264 10.464a.9.9 0 0 0 1.272 1.272l5.1-5.1a.9.9 0 0 0 0-1.272l-5.1-5.1a.9.9 0 0 0-1.272 0Z"
      clipRule="evenodd"
    />
  </Svg>
);

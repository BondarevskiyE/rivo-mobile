import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const CloseIcon = (props: SvgProps) => (
  <Svg width={14} height={14} fill="none" {...props}>
    <Path
      fill="#fff"
      d="M.264.264a.9.9 0 0 1 1.272 0L7 5.727 12.464.264a.9.9 0 0 1 1.272 1.272L8.273 7l5.463 5.464a.9.9 0 1 1-1.272 1.272L7 8.273l-5.464 5.463a.9.9 0 1 1-1.272-1.272L5.727 7 .264 1.536a.9.9 0 0 1 0-1.272Z"
    />
  </Svg>
);

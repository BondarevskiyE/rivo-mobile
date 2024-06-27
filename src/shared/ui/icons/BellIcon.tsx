import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const BellIcon = (props: SvgProps) => (
  <Svg width={18} height={20} fill="none" {...props}>
    <Path
      fill="currentColor"
      d="M9.001 19.5c-1.692 0-3-.875-3-2.5h6c0 1.625-1.307 2.5-3 2.5Zm5.994-7.79c0 1.714 2.148 2.142 2.148 3 0 .857-.429 1.285-2.143 1.285H3c-1.714 0-2.143-.428-2.143-1.285 0-.858 2.143-1.286 2.143-3v-3C3 4.424 4.714.857 8.143.857 8.143.214 8.57 0 9 0s.857.214.857.857c3.429 0 5.138 3.567 5.138 7.853v3Z"
    />
  </Svg>
);

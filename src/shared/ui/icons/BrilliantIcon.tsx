import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const BrilliantIcon = (props: SvgProps) => (
  <Svg width={22} height={17} fill="none" {...props}>
    <Path
      stroke="#111"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.5}
      strokeWidth={1.4}
      d="M20.429 6.786 11 16.214 1.572 6.786"
    />
    <Path
      stroke="#111"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={0.5}
      strokeWidth={1.4}
      d="M14.429 8.5 11 16.214 7.572 8.5M1.572 6.786 7.7 8.5h6.6l6.129-1.714M4.143 2.5l5.143 1.714h3.428L17.43 2.5 14.375.786h-6.75L4.143 2.5ZM7.572 7.643l1.285-3.429M13.143 4.214l1.286 3.429M20.429 6.786l-3-4.286M1.572 6.786 4.143 2.5"
    />
  </Svg>
);

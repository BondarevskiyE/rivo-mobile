import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const CloseIcon = ({color, ...props}: SvgProps) => (
  <Svg width={12} height={12} fill="none" color={color || '#fff'} {...props}>
    <Path
      fill="currentColor"
      d="M11.614 11.614a.75.75 0 0 1-1.061 0L6 7.06l-4.553 4.553a.75.75 0 0 1-1.06-1.061L4.938 6 .386 1.447A.75.75 0 1 1 1.447.387L6 4.938 10.553.386a.75.75 0 0 1 1.06 1.061L7.062 6l4.553 4.553a.75.75 0 0 1 0 1.06Z"
    />
  </Svg>
);

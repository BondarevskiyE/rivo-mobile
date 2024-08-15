import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const SettingsIcon = (props: SvgProps) => (
  <Svg width={16} height={12} fill="none" color={'#fff'} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M3.202 3.417a2.418 2.418 0 0 0 4.596 0h6.869a.75.75 0 0 0 0-1.5H7.798a2.418 2.418 0 0 0-4.596 0H1.333a.75.75 0 1 0 0 1.5h1.869ZM5.5 1.75a.917.917 0 1 0 0 1.833.917.917 0 0 0 0-1.833ZM.583 9.333a.75.75 0 0 1 .75-.75h6.869a2.418 2.418 0 0 1 4.596 0h1.869a.75.75 0 0 1 0 1.5h-1.869a2.418 2.418 0 0 1-4.596 0H1.333a.75.75 0 0 1-.75-.75Zm9 0a.917.917 0 1 1 1.834 0 .917.917 0 0 1-1.834 0Z"
      clipRule="evenodd"
    />
  </Svg>
);

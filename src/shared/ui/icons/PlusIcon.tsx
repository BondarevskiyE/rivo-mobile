import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const PlusIcon = (props: SvgProps) => (
  <Svg
    width={18}
    height={18}
    viewBox="0 0 18 18"
    fill="none"
    color="#fff"
    {...props}>
    <Path
      fill="currentColor"
      d="M9 0a.9.9 0 0 1 .9.9v7.2h7.2a.9.9 0 1 1 0 1.8l-7.2-.001V17.1a.9.9 0 1 1-1.8 0V9.9L.9 9.9a.9.9 0 1 1 0-1.8h7.2V.9A.9.9 0 0 1 9 0Z"
    />
  </Svg>
);

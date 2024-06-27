import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const ChartsIcon = (props: SvgProps) => (
  <Svg width={16} height={18} fill="none" {...props}>
    <Path
      fill="currentColor"
      d="M2 6a2 2 0 0 1 2 2v8a2 2 0 1 1-4 0V8a2 2 0 0 1 2-2Zm12 3a2 2 0 0 1 2 2v5a2 2 0 1 1-4 0v-5a2 2 0 0 1 2-2ZM8 0a2 2 0 0 1 2 2v14a2 2 0 1 1-4 0V2a2 2 0 0 1 2-2Z"
    />
  </Svg>
);

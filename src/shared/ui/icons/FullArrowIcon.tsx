import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const FullArrowIcon = (props: SvgProps) => (
  <Svg
    width={14}
    height={16}
    viewBox="0 0 14 16"
    fill="none"
    color="#F95E00"
    {...props}>
    <Path
      fill="currentColor"
      d="M6.473.716a.75.75 0 0 1 1.054 0l5.916 5.833a.75.75 0 1 1-1.053 1.068L7.75 3.043V14.75a.75.75 0 0 1-1.5 0V3.043L1.61 7.617A.75.75 0 1 1 .557 6.55L6.473.716Z"
    />
  </Svg>
);

import * as React from 'react';
import Svg, {SvgProps, Rect, Path} from 'react-native-svg';

export const OrangePlusCircleIcon = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Rect width={24} height={24} fill="#F95E00" rx={12} />
    <Path
      fill="#fff"
      d="M12 5.25c.373 0 .675.302.675.675v5.4h5.4a.675.675 0 1 1 0 1.35h-5.4v5.4a.675.675 0 1 1-1.35 0v-5.4h-5.4a.675.675 0 0 1 0-1.35h5.4v-5.4c0-.373.302-.675.675-.675Z"
    />
  </Svg>
);

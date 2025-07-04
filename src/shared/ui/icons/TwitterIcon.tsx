import * as React from 'react';
import Svg, {Path, SvgProps} from 'react-native-svg';

export const TwitterIcon = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" {...props}>
    <Path
      fill="#1DA1F2"
      d="M6.29 18.126c7.547 0 11.675-6.253 11.675-11.676 0-.177 0-.354-.012-.53A8.348 8.348 0 0 0 20 3.796a8.179 8.179 0 0 1-2.357.646 4.117 4.117 0 0 0 1.804-2.27 8.221 8.221 0 0 1-2.605.996A4.107 4.107 0 0 0 9.849 6.91a11.65 11.65 0 0 1-8.457-4.287 4.106 4.106 0 0 0 1.27 5.478A4.067 4.067 0 0 1 .8 7.587v.052a4.105 4.105 0 0 0 3.292 4.023 4.097 4.097 0 0 1-1.853.07 4.109 4.109 0 0 0 3.834 2.85A8.234 8.234 0 0 1 0 16.282a11.618 11.618 0 0 0 6.29 1.84"
    />
  </Svg>
);

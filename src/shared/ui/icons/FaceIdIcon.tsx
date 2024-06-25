import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const FaceIdIcon = (props: SvgProps) => (
  <Svg width={30} height={30} fill="none" {...props}>
    <Path
      stroke="#84868D"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M28.333 9.667V9v0c0-1.239 0-1.858-.09-2.375a6 6 0 0 0-4.868-4.867c-.517-.091-1.136-.091-2.375-.091v0h-.667m8 18.666V21c0 1.239 0 1.858-.09 2.375a6 6 0 0 1-4.868 4.867c-.517.091-1.136.091-2.375.091v0h-.667m-18.666-8V21c0 1.239 0 1.858.09 2.375a6 6 0 0 0 4.868 4.867c.517.091 1.136.091 2.375.091v0h.667m-8-18.666V9v0c0-1.239 0-1.858.09-2.375a6 6 0 0 1 4.868-4.867C7.142 1.667 7.76 1.667 9 1.667v0h.667m5.333 8V15c0 .736-.597 1.333-1.333 1.333m-4-6.666v2m10.666-2v2M20.334 19a6.657 6.657 0 0 1-5.333 2.667A6.657 6.657 0 0 1 9.667 19"
    />
  </Svg>
);

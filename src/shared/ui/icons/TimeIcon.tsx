import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const TimeIcon = (props: SvgProps) => (
  <Svg
    width={19}
    height={18}
    viewBox="0 0 19 18"
    color="#fff"
    fill="none"
    {...props}>
    <Path
      fill="currentColor"
      fillOpacity={0.5}
      d="M9.5.429a8.572 8.572 0 1 1-.001 17.144A8.572 8.572 0 0 1 9.5.429Zm0 1.428a7.143 7.143 0 1 0 0 14.285 7.143 7.143 0 0 0 0-14.285Zm-.357 2.857c.394 0 .714.32.714.715v3.645l3.482 1.407a.714.714 0 0 1-.535 1.324l-3.929-1.587a.714.714 0 0 1-.446-.662V5.429c0-.395.32-.715.714-.715Z"
    />
  </Svg>
);

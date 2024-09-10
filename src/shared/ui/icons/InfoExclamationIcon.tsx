import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const InfoExclamationIcon = (props: SvgProps) => (
  <Svg width={20} height={20} fill="none" color="#111" {...props}>
    <Path
      fill="currentColor"
      fillOpacity={0.5}
      d="M10 18.105a8.105 8.105 0 1 0 0-16.21 8.105 8.105 0 0 0 0 16.21ZM10 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10Zm0-12.372a1.316 1.316 0 1 1 0-2.632 1.316 1.316 0 0 1 0 2.632Zm-.947 2.822c0-.541.424-.98.947-.98.523 0 .947.439.947.98v3.83c0 .54-.424.98-.947.98-.523 0-.947-.44-.947-.98v-3.83Z"
    />
  </Svg>
);

import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const DiogonalArrowIcon = (props: SvgProps) => (
  <Svg width={11} height={11} fill="none" {...props}>
    <Path
      fill="#111"
      fillOpacity={0.5}
      d="M10.313.045c.355 0 .642.287.642.643v6.75a.643.643 0 1 1-1.285 0v-5.2L1.954 9.956a.643.643 0 0 1-.849.053l-.06-.053a.643.643 0 0 1 0-.91L8.76 1.33H3.563a.643.643 0 0 1-.639-.567L2.92.688c0-.356.287-.643.643-.643h6.75Z"
    />
  </Svg>
);

import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const LightingLineIcon = (props: SvgProps) => (
  <Svg width={12} height={18} fill="none" {...props}>
    <Path
      stroke="#111"
      strokeLinecap="round"
      strokeOpacity={0.5}
      strokeWidth={1.2}
      d="M3.972 15.127c-.404 1.778.202 2.147 1.287.849l4.555-5.723c1.054-1.407.79-2.537-.728-2.82L6.89 6.99c-.128-.026-.213-.161-.19-.301l.003-.014.845-3.813c.405-1.79-.27-2.113-1.282-.845a663.002 663.002 0 0 1-3.315 4.063c-.264.32-.688.818-1.273 1.496-1.282 1.555-.608 2.684.875 2.966l2.1.412c.128.025.213.16.19.3l-.003.016-.868 3.858Z"
    />
  </Svg>
);

import * as React from 'react';
import Svg, {
  SvgProps,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

export const BilateralArrowIcon = (props: SvgProps) => {
  const color = props?.color || '#C48AFF';
  return (
    <Svg width={15} height={14} fill="none" color={color} {...props}>
      <Path
        fill="url(#a)"
        d="M1.584 9.492a.671.671 0 0 0 1.343 0V3.875c0-1.314.788-2.142 1.868-2.142 1.088 0 1.898.812 1.898 2.142v5.202c0 2.203 1.358 3.6 3.234 3.6 1.868 0 3.211-1.397 3.211-3.6V3.521a.671.671 0 1 0-1.343 0v5.663c0 1.306-.787 2.134-1.868 2.134-1.088 0-1.898-.813-1.898-2.134V3.98c0-2.203-1.358-3.6-3.234-3.6-1.868 0-3.21 1.397-3.21 3.6v5.51Zm-1.05.094c-.54 0-.676.372-.383.79l1.68 2.415c.248.357.608.35.849 0l1.68-2.423c.285-.41.15-.782-.383-.782H.534Zm10.218-6.114h3.437c.532 0 .675-.372.382-.79L12.898.26c-.24-.342-.6-.35-.848 0l-1.68 2.415c-.3.426-.158.798.383.798Z"
      />
      <Defs>
        <LinearGradient
          id="a"
          x1={-7.36}
          x2={5.603}
          y1={6.528}
          y2={21.143}
          gradientUnits="userSpaceOnUse">
          <Stop stopColor={color} />
          <Stop offset={1} stopColor={color} />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};

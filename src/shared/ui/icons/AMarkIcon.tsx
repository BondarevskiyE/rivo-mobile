import * as React from 'react';
import Svg, {SvgProps, Rect, Path} from 'react-native-svg';

export const AMarkIcon = (props: SvgProps) => (
  <Svg width={18} height={18} fill="none" {...props}>
    <Rect width={18} height={18} fill="#000" fillOpacity={0.03} rx={9} />
    <Path
      fill="#111"
      fillOpacity={0.5}
      d="M5.97 13.104c-.484 0-.796-.281-.796-.728 0-.123.03-.294.104-.484l2.565-6.973c.214-.587.57-.857 1.145-.857.581 0 .936.257 1.157.851l2.57 6.979c.074.202.105.343.105.484 0 .428-.33.728-.79.728-.428 0-.667-.196-.808-.667l-.581-1.69h-3.3l-.582 1.678c-.146.477-.38.68-.79.68Zm1.744-3.606h2.54L9 5.728h-.043l-1.243 3.77Z"
    />
  </Svg>
);

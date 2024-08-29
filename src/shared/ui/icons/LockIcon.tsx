import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const LockIcon = (props: SvgProps) => (
  <Svg
    width={32}
    height={36}
    viewBox="0 0 32 36"
    fill="none"
    color="#fff"
    {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M26 10c0-5.523-4.477-10-10-10S6 4.477 6 10l-.002 4h-.87c-1.783 0-2.43.186-3.082.534a3.635 3.635 0 0 0-1.512 1.512C.186 16.698 0 17.345 0 19.128v11.744c0 1.783.186 2.43.534 3.082.349.651.86 1.163 1.512 1.512.652.348 1.299.534 3.082.534h21.744c1.783 0 2.43-.186 3.082-.534a3.635 3.635 0 0 0 1.512-1.512c.348-.652.534-1.299.534-3.082V19.128c0-1.783-.186-2.43-.534-3.082a3.635 3.635 0 0 0-1.512-1.512c-.652-.348-1.299-.534-3.082-.534h-.874L26 10Zm-16 0a6 6 0 0 1 12 0l-.002 4h-12L10 10Zm6 12a2 2 0 0 0-2 2v4a2 2 0 1 0 4 0v-4a2 2 0 0 0-2-2Z"
      clipRule="evenodd"
    />
  </Svg>
);

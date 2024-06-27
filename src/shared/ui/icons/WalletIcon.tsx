import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';

export const WalletIcon = (props: SvgProps) => (
  <Svg width={24} height={24} fill="none" {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M7.8 3.1h-.038c-.808 0-1.469 0-2.006.044-.556.045-1.058.142-1.527.381A3.9 3.9 0 0 0 2.525 5.23c-.239.47-.336.971-.381 1.527-.007.079-.012.16-.017.244H2v8.2c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C4.28 20 5.12 20 6.8 20h10.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C22 17.72 22 16.88 22 15.2v-3.4c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311c-.376-.192-.82-.271-1.462-.304V6.5a3.4 3.4 0 0 0-3.4-3.4H7.8ZM17.1 7v-.5a1.6 1.6 0 0 0-1.6-1.6H7.8c-.855 0-1.442 0-1.897.038-.445.036-.684.103-.856.19a2.1 2.1 0 0 0-.918.919c-.088.172-.155.411-.191.856A7.213 7.213 0 0 0 3.93 7H17.1Z"
      clipRule="evenodd"
    />
    <Path
      stroke="transparent"
      strokeLinecap="round"
      strokeWidth={1.8}
      d="M16 14h1.2"
    />
  </Svg>
);

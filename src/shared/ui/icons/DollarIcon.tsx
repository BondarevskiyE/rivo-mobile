import * as React from 'react';
import Svg, {SvgProps, Path} from 'react-native-svg';
import {IconWithShadow, WithShadowProps} from './IconWithShadow';

export const DollarIcon = (props: SvgProps) => (
  <Svg width={36} height={36} fill="none" {...props}>
    <Path
      fill="currentColor"
      d="M18 36C8.058 36 0 27.942 0 18S8.058 0 18 0s18 8.058 18 18a18 18 0 0 1-18 18Zm-1.072-24.68a3.952 3.952 0 0 0-3.754 3.785c0 1.853 1.134 3.064 3.54 3.569l1.684.398c1.64.383 2.314.935 2.314 1.87 0 .934-1.18 1.853-2.712 1.853a2.911 2.911 0 0 1-2.757-1.394 1.042 1.042 0 0 0-.935-.598h-.904a.537.537 0 0 0-.429.628 4.183 4.183 0 0 0 3.999 3.187v1.287a1.08 1.08 0 0 0 2.16 0v-1.302A4.014 4.014 0 0 0 23.1 20.65c0-1.945-1.118-3.064-3.768-3.63l-1.532-.337c-1.532-.383-2.252-.889-2.252-1.747 0-.858.92-1.807 2.451-1.807a2.512 2.512 0 0 1 2.436 1.24 1.226 1.226 0 0 0 1.103.705h.72a.643.643 0 0 0 .475-.766 4.06 4.06 0 0 0-3.646-3.064v-1.057a1.08 1.08 0 0 0-2.16 0v1.134Z"
    />
  </Svg>
);

export const DollarIconWithShadow = (props: WithShadowProps) => {
  return (
    <IconWithShadow {...props}>
      <DollarIcon {...props} />
    </IconWithShadow>
  );
};

import React from 'react';
import {withChildren} from '@/shared/types';
import {SvgProps} from 'react-native-svg';
import {Shadow} from 'react-native-shadow-2';

export type WithShadowProps = {
  shadowColor: string;
  width: number;
  height: number;
  distance?: number;
} & withChildren &
  SvgProps;

// Wrapper for icon shadows

export const IconWithShadow: React.FC<WithShadowProps> = ({
  shadowColor,
  width,
  height,
  distance = 10,
  children,
  style,
}) => {
  return (
    <Shadow
      startColor={shadowColor}
      distance={distance}
      style={[
        {width: +width, height: +height, borderRadius: +(width || 0) / 2},
        style,
      ]}>
      {children}
    </Shadow>
  );
};

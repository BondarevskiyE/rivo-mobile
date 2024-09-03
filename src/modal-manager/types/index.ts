import {ReactNode} from 'react';
import {StyleProp} from 'react-native';

export type ReactChildren = ReactNode;

export type ModalData = {
  children: ReactChildren;
};

export type ModalAnimationInType =
  | 'bounce'
  | 'flash'
  | 'jello'
  | 'pulse'
  | 'rotate'
  | 'rubberBand'
  | 'shake'
  | 'swing'
  | 'tada'
  | 'wobble'
  | 'bounceIn'
  | 'bounceInDown'
  | 'bounceInUp'
  | 'bounceInLeft'
  | 'bounceInRight'
  | 'bounceOut'
  | 'bounceOutDown'
  | 'bounceOutUp'
  | 'bounceOutLeft'
  | 'bounceOutRight'
  | 'fadeIn'
  | 'fadeInDown'
  | 'fadeInDownBig'
  | 'fadeInUp'
  | 'fadeInUpBig'
  | 'fadeInLeft'
  | 'fadeInLeftBig'
  | 'fadeInRight'
  | 'fadeInRightBig'
  | 'fadeOut'
  | 'fadeOutDown'
  | 'fadeOutDownBig'
  | 'fadeOutUp'
  | 'fadeOutUpBig'
  | 'fadeOutLeft'
  | 'fadeOutLeftBig'
  | 'fadeOutRight'
  | 'fadeOutRightBig'
  | 'flipInX'
  | 'flipInY'
  | 'flipOutX'
  | 'flipOutY'
  | 'lightSpeedIn'
  | 'lightSpeedOut'
  | 'slideInDown'
  | 'slideInUp'
  | 'slideInLeft'
  | 'slideInRight'
  | 'slideOutDown'
  | 'slideOutUp'
  | 'slideOutLeft'
  | 'slideOutRight'
  | 'zoomIn'
  | 'zoomInDown'
  | 'zoomInUp'
  | 'zoomInLeft'
  | 'zoomInRight'
  | 'zoomOut'
  | 'zoomOutDown'
  | 'zoomOutUp'
  | 'zoomOutLeft'
  | 'zoomOutRight';

export type ModalOptions = {
  dismissable: boolean;
  position: 'center' | 'bottom' | 'floatBottom' | 'floatTop' | 'custom';
  animationIn?: ModalAnimationInType;
  animationOut?: ModalAnimationInType;
  animationInTiming?: number;
  animationOutTiming?: number;
  backdropTransitionInTiming?: number;
  backdropTransitionOutTiming?: number;
  animated?: boolean;
  backdropOpacity?: number;
  onHide?: () => void;
};

export type ModalShowParams = ModalData & ModalOptions;

export type ModalHideParams = {};

export type ModalRef = {
  show: (params: ModalShowParams) => void;
  hide: (params?: ModalHideParams) => void;
  changeOptions: (params?: Partial<ModalOptions>) => void;
};

export type ModalConfig = {
  style?: StyleProp<any>;
};

export type ModalProps = {
  config?: ModalConfig;
};

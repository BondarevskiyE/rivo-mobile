import {ReactNode} from 'react';
import {StyleProp} from 'react-native';

export type ReactChildren = ReactNode;

export type ModalData = {
  children: ReactChildren;
};

export type ModalOptions = {
  dismissable: boolean;
  position: 'center' | 'bottom' | 'floatBottom' | 'floatTop';
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

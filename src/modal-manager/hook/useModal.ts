import {useCallback, useState} from 'react';
import {ModalData, ModalOptions, ModalProps, ModalShowParams} from '../types';
import {mergeIfDefined} from '../utils/obj.ts';

export type UseModalParams = {
  defaultOptions: Omit<ModalProps, 'config'>;
};

const DEFAULT_OPTIONS: ModalOptions = {
  dismissable: true,
  animationIn: 'slideInUp',
  animationInTiming: 300,
  animationOut: 'slideOutDown',
  animationOutTiming: 300,
  backdropTransitionInTiming: 300,
  backdropTransitionOutTiming: 300,
  position: 'center',
  animated: false,
};

export const useModal = ({defaultOptions}: UseModalParams) => {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState<ModalData>({
    children: null,
  });

  const initialOptions = mergeIfDefined(
    DEFAULT_OPTIONS,
    defaultOptions,
  ) as Required<ModalOptions>;

  const [options, setOptions] = useState<ModalOptions>(initialOptions);

  const changeOptions = useCallback((params: Partial<ModalShowParams>) => {
    setOptions({
      ...options,
      ...params,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const show = useCallback(
    (params: ModalShowParams) => {
      setData({
        children: params.children ?? null,
      });
      setOptions({
        dismissable: params.dismissable ?? initialOptions.dismissable,
        position: params.position ?? initialOptions.position,
        animationIn: params.animationIn ?? initialOptions.animationIn,
        animationInTiming:
          params.animationInTiming ?? initialOptions.animationInTiming,
        animationOut: params.animationOut ?? initialOptions.animationOut,
        animationOutTiming:
          params.animationOutTiming ?? initialOptions.animationOutTiming,
        backdropTransitionInTiming:
          params.backdropTransitionInTiming ??
          initialOptions.backdropTransitionInTiming,
        backdropTransitionOutTiming:
          params.backdropTransitionOutTiming ??
          initialOptions.backdropTransitionOutTiming,
        animated: params.animated,
        backdropOpacity: params.backdropOpacity,
        onHide: params.onHide,
      });
      setIsVisible(true);
    },
    [initialOptions],
  );

  const hide = useCallback(() => {
    setIsVisible(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOptions]);

  const onHide = useCallback(() => {
    options?.onHide?.();

    setData({
      children: null,
    });
    setOptions(initialOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOptions]);

  return {
    isVisible,
    show,
    hide,
    changeOptions,
    data,
    options,
    onHide,
  };
};

import {StyleProps} from 'react-native-reanimated';

export type LayoutAnimation = {
  initialValues: StyleProps;
  animations: StyleProps;
  callback?: (finished: boolean) => void;
};

export type ExitAnimationsValues = CurrentLayoutAnimationsValues &
  WindowDimensions;

type CurrentLayoutAnimationsValues = {
  // @ts-ignore
  [('currentOriginX',
  'currentOriginY',
  'currentWidth',
  'currentHeight',
  'currentBorderRadius',
  'currentGlobalOriginX',
  'currentGlobalOriginY')]: number;
};

export type EntryAnimationsValues = TargetLayoutAnimationsValues &
  WindowDimensions;

type TargetLayoutAnimationsValues = {
  // @ts-ignore
  [('targetOriginX',
  'targetOriginY',
  'targetWidth',
  'targetHeight',
  'targetBorderRadius',
  'targetGlobalOriginX',
  'targetGlobalOriginY')]: number;
};

interface WindowDimensions {
  [x: string]: any;
  windowWidth: number;
  windowHeight: number;
}

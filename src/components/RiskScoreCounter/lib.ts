import {Colors} from '@/shared/ui';

export const COUNTER_WIDTH = 211;
export const COUNTER_HEIGHT = COUNTER_WIDTH / 2;
const COUNTER_RADIUS = COUNTER_WIDTH / 2;
export const POINTER_DIAMETER = 14;
// degrees in 1 percent
const ANGLE_MULTIPLIER = 180 / 100;

export const getPointerBottomPosition = (percent: number) => {
  const pointerShift = 3;

  return (
    COUNTER_RADIUS * Math.sin((percent * ANGLE_MULTIPLIER * Math.PI) / 180) -
    (POINTER_DIAMETER / 2 + pointerShift)
  );
};

export const getPointerLeftPosition = (percent: number) => {
  let pointerShift = 0;

  if (percent < 50) {
    pointerShift += 33;
  }

  if (percent === 50) {
    pointerShift -= -33;
  }

  if (percent > 50) {
    pointerShift -= -29.5;
  }

  return (
    COUNTER_RADIUS / 2 +
    COUNTER_RADIUS * -Math.cos((percent * ANGLE_MULTIPLIER * Math.PI) / 180) +
    POINTER_DIAMETER +
    pointerShift
  );
};

export const getRiskScoreColor = (riskScore: number) => {
  if (riskScore < 69) {
    return Colors.ui_orange_60;
  }

  if (riskScore < 89) {
    return Colors.ui_orange_70;
  }

  return Colors.ui_green_50;
};

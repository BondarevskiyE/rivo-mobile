export enum TaskType {
  DEFAULT = 'default',
  PROGRESS = 'progress',
  BUTTON = 'button',
  COMPLETED = 'completed',
}

export interface DefaultProps {
  title: string;
  subTitle: string;
}

export interface DefaultTypeProps {
  type: TaskType.DEFAULT;
  earned: string;
}

export interface ProgressTypeProps {
  type: TaskType.PROGRESS;
  progressPercent: number;
  left: string;
}

export interface ButtonTypeProps {
  type: TaskType.BUTTON;
  link: string;
}

export interface CompletedTypeProps {
  type: TaskType.COMPLETED;
}

export const isButtonTask = (
  props:
    | DefaultTypeProps
    | ButtonTypeProps
    | ProgressTypeProps
    | CompletedTypeProps,
): props is ButtonTypeProps => {
  return props.type === TaskType.BUTTON;
};

export const isDefaultTask = (
  props:
    | DefaultTypeProps
    | ButtonTypeProps
    | ProgressTypeProps
    | CompletedTypeProps,
): props is DefaultTypeProps => {
  return props.type === TaskType.DEFAULT;
};

export const isCompletedTask = (
  props:
    | DefaultTypeProps
    | ButtonTypeProps
    | ProgressTypeProps
    | CompletedTypeProps,
): props is CompletedTypeProps => {
  return props.type === TaskType.COMPLETED;
};

export const isProgressTask = (
  props:
    | DefaultTypeProps
    | ButtonTypeProps
    | ProgressTypeProps
    | CompletedTypeProps,
): props is ProgressTypeProps => {
  return props.type === TaskType.PROGRESS;
};

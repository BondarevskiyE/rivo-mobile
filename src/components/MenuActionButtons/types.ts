export enum ButtonType {
  LINK,
  INTERNAL,
  IN_APP_BROWSER_LINK,
  SWITCH,
  ACTION,
}

export interface LinkActionMenuButton {
  title: string | React.ReactNode;
  type: Omit<ButtonType, 'switch'>;
  action: (boolean?: boolean) => void;
  Icon: React.JSX.ElementType;
}

export interface SwitchActionMenuButton {
  title: string | React.ReactNode;
  type: ButtonType.SWITCH;
  isEnabled: boolean;
  action: (boolean: boolean) => void;
  Icon: React.JSX.ElementType;
}

export type ActionMenuButton = LinkActionMenuButton | SwitchActionMenuButton;

export function isSwitchElement(
  el: ActionMenuButton,
): el is SwitchActionMenuButton {
  return el.type === ButtonType.SWITCH;
}

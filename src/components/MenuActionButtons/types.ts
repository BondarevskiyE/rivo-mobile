export type ButtonType = 'link' | 'internal' | 'in-app-browser-link';

export interface ActionMenuButton {
  title: string | React.ReactNode;
  type: ButtonType;
  action: (boolean?: boolean) => void;
  Icon: React.JSX.ElementType;
}

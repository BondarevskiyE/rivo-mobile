export type AutofillButtons = {name: string; percent: number}[];

export enum SEND_TRANSACTION_FORM_TYPE {
  INVEST,
  WITHDRAW,
}

export enum TRANSACTION_STATUS {
  SUCCESS,
  FAIL,
  NONE,
}

export enum TEXT_SIGN_POSITION {
  UP_LEFT,
  RIGHT,
}

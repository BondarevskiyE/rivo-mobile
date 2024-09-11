import {CHANGE_PASSCODE_STEPS} from './ChangePasscodeScreen';

export const getTitleText = (step: CHANGE_PASSCODE_STEPS) => {
  if (step === CHANGE_PASSCODE_STEPS.ENTER_OLD_PASSCODE) {
    return 'Enter your passcode';
  }

  if (step === CHANGE_PASSCODE_STEPS.SET_UP_NEW_PASSCODE) {
    return 'Set up a new passcode';
  }

  if (step === CHANGE_PASSCODE_STEPS.REPEAT_NEW_PASSCODE) {
    return 'Repeat your passcode';
  }
};

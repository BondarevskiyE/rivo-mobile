import {REGISTER_PASSCODE_STEPS} from './PassCodeRegistrationScreen';

export const getPasscodeFormText = (step: REGISTER_PASSCODE_STEPS) => {
  switch (step) {
    case REGISTER_PASSCODE_STEPS.ENTER_PASSCODE:
      return 'Now let’s set up a passcode';

    case REGISTER_PASSCODE_STEPS.REPEAT_PASSCODE:
      return 'Repeat your passcode';
  }
};

import {BIOMETRY_TYPE} from 'react-native-keychain';

export const getBiometryName = (type: BIOMETRY_TYPE) => {
  switch (type) {
    case BIOMETRY_TYPE.FACE:
      return 'Face ID';
    case BIOMETRY_TYPE.FACE_ID:
      return 'Face ID';
    case BIOMETRY_TYPE.FINGERPRINT:
      return 'Fingerprint';
    case BIOMETRY_TYPE.IRIS:
      return 'Iris';
    case BIOMETRY_TYPE.OPTIC_ID:
      return 'Optic ID';
    case BIOMETRY_TYPE.TOUCH_ID:
      return 'Touch ID';
    default:
      break;
  }
};

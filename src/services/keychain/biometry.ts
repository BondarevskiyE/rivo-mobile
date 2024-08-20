import * as Keychain from 'react-native-keychain';

export const KEYCHAIN_BIOMETRY_SERVICE_NAME = 'biometry-pincode';

export const getBiometrySupportedType = async () => {
  try {
    const biometryType = await Keychain.getSupportedBiometryType();
    return biometryType;
  } catch (error) {
    return false;
  }
};

export const isFingerprintBiometry = (type: Keychain.BIOMETRY_TYPE) => {
  if (
    type === Keychain.BIOMETRY_TYPE.FINGERPRINT ||
    type === Keychain.BIOMETRY_TYPE.TOUCH_ID
  ) {
    return true;
  }
  return false;
};

export const isFaceBiometry = (type: Keychain.BIOMETRY_TYPE) => {
  if (
    type === Keychain.BIOMETRY_TYPE.FACE ||
    type === Keychain.BIOMETRY_TYPE.FACE_ID ||
    type === Keychain.BIOMETRY_TYPE.OPTIC_ID
  ) {
    return true;
  }
  return false;
};

export const saveCredentialsWithBiometry = async (
  username: string,
  password: string,
) => {
  try {
    await Keychain.setInternetCredentials(
      KEYCHAIN_BIOMETRY_SERVICE_NAME,
      username,
      password,
      {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      },
    );
    return true;
  } catch (error) {
    // console.log('Error saving credentials:', error.message);
    return false;
  }
};

export const getCredentialsWithBiometry = async () => {
  try {
    const credentials = await Keychain.getInternetCredentials(
      KEYCHAIN_BIOMETRY_SERVICE_NAME,
      {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      },
    );
    return credentials;
  } catch (error) {
    // console.log('Error retrieving credentials:', error.message);
    return null;
  }
};

export const resetCredentialsWithBiometry = async () => {
  try {
    return await Keychain.resetInternetCredentials(
      KEYCHAIN_BIOMETRY_SERVICE_NAME,
      {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
      },
    );
  } catch (error) {
    return false;
  }
};

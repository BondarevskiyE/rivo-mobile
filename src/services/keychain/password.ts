import * as Keychain from 'react-native-keychain';

export const KEYCHAIN_PASSWORD_SERVICE_NAME = 'pincode';

export const saveCredentialsWithPassword = async (
  username: string,
  password: string,
) => {
  try {
    await Keychain.setInternetCredentials(
      KEYCHAIN_PASSWORD_SERVICE_NAME,
      username,
      password,
      {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      },
    );
    return true;
  } catch (error) {
    // console.log('Error saving credentials:', error.message);
    return false;
  }
};

export const getCredentialsWithPassword = async () => {
  try {
    const credentials = await Keychain.getInternetCredentials(
      KEYCHAIN_PASSWORD_SERVICE_NAME,
    );
    return credentials;
  } catch (error) {
    // console.log('Error retrieving credentials:', error.message);
    return null;
  }
};

export const resetCredentialsWithPassword = async () => {
  try {
    return await Keychain.resetInternetCredentials(
      KEYCHAIN_PASSWORD_SERVICE_NAME,
    );
  } catch (error) {
    return false;
  }
};

import * as Keychain from 'react-native-keychain';

export const KEYCHAIN_PRIVATEKEY_SERVICE_NAME = 'privateKey';

export const savePrivateKeyInKeychain = async (
  username: string,
  privateKey: string,
) => {
  try {
    await Keychain.setInternetCredentials(
      KEYCHAIN_PRIVATEKEY_SERVICE_NAME,
      username,
      privateKey,
      {
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      },
    );
    return true;
  } catch (error) {
    return false;
  }
};

export const getPrivateKeyFromKeyChain = async () => {
  try {
    const credentials = await Keychain.getInternetCredentials(
      KEYCHAIN_PRIVATEKEY_SERVICE_NAME,
    );
    return credentials;
  } catch (error) {
    return null;
  }
};

export const resetPrivateKeyInKeychain = async () => {
  try {
    return await Keychain.resetInternetCredentials(
      KEYCHAIN_PRIVATEKEY_SERVICE_NAME,
    );
  } catch (error) {
    return false;
  }
};

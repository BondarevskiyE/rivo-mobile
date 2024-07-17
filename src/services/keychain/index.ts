import {resetCredentialsWithBiometry} from './biometry';
import {resetCredentialsWithPassword} from './password';
import {resetPrivateKeyInKeychain} from './privateKey';

export const resetKeychainCredentials = async () => {
  const isResetedBiometry = await resetCredentialsWithBiometry();
  const isResetedPassword = await resetCredentialsWithPassword();
  const isResetedPrivateKey = await resetPrivateKeyInKeychain();

  return isResetedBiometry && isResetedPassword && isResetedPrivateKey;
};

export * from './biometry';
export * from './password';
export * from './privateKey';

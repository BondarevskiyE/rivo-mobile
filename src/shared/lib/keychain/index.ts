import {resetCredentialsWithBiometry} from './biometry';
import {resetCredentialsWithPassword} from './password';

export const resetCredentials = async () => {
  const isResetedBiometry = await resetCredentialsWithBiometry();
  const isResetedPassword = await resetCredentialsWithPassword();
  return isResetedBiometry && isResetedPassword;
};

export * from './biometry';
export * from './password';

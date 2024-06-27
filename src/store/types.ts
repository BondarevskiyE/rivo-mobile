export enum LOGIN_PROVIDER {
  GOOGLE = 'google',
  TWITTER = 'twitter',
}

export type User = {
  id: string;
  name: string | null;
  email: string;
  photo: string | null;
  familyName: string | null;
  givenName: string | null;
  loginProvider: LOGIN_PROVIDER;
};

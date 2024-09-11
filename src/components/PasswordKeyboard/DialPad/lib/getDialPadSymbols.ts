import {BIOMETRY_TYPE} from 'react-native-keychain';

import {isFaceBiometry} from '@/services/keychain';

interface Params {
  withBiometry: boolean;
  withExit: boolean;
  biometryType: BIOMETRY_TYPE | null;
}

export const getDialPadSymbols = ({
  withBiometry,
  withExit,
  biometryType,
}: Params) => {
  const getLastKeySymbol = () => {
    if (withBiometry && biometryType) {
      return isFaceBiometry(biometryType) ? 'faceId' : 'touchId';
    }
    return 'del';
  };

  const dialPadSymbols = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    // show exit icons if needed
    withExit ? 'exit' : '',
    '0',
    // show biometry icons if needed
    getLastKeySymbol(),
  ];
  return dialPadSymbols;
};

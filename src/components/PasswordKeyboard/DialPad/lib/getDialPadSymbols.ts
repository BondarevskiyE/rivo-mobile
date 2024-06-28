interface Params {
  withBiometry: boolean;
  withExit: boolean;
}

export const getDialPadSymbols = ({withBiometry, withExit}: Params) => {
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
    withBiometry ? 'biometry' : 'del',
  ];
  return dialPadSymbols;
};

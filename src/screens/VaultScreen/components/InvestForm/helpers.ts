export const getInputFontSize = (inputLength: number) => {
  if (inputLength > 10) {
    return 32;
  }

  if (inputLength > 5) {
    return 48;
  }

  return 64;
};

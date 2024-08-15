import {useState} from 'react';

export const useInputFormat = () => {
  const [inputValue, setInputValue] = useState<string>('');
  // only for empty dot ().0)
  const [additionalValue, setAdditionalValue] = useState<string>('');

  const onAddSymbol = (symbol: string) => {
    if (inputValue.length > 10) {
      return;
    }
    setInputValue(prev => {
      const isPrevSymbolDot = !!additionalValue;
      const isDotSymbol = symbol === '.';

      if (isDotSymbol && prev.includes('.')) {
        return prev;
      }

      // we don't need two dots
      if (isPrevSymbolDot && isDotSymbol) {
        return prev;
      }

      // if the prev symbol is dot we need to remove .0 and add real symbol
      if (isPrevSymbolDot) {
        setAdditionalValue('');
        return `${prev}.${symbol}`;
      }

      // if the symbol is dot we need to show changed value but without changing real input value
      if (isDotSymbol) {
        setAdditionalValue('.0');
        return prev;
      }

      return `${prev}${symbol}`;
    });
  };

  const onRemoveSymbol = () => {
    setInputValue(prev => {
      const isPrevSymbolDot = !!additionalValue;

      if (isPrevSymbolDot) {
        setAdditionalValue('');
        return prev;
      }

      const newValue = `${+prev.slice(0, prev.length - 1)}`;

      return newValue === '0' ? '' : newValue;
    });
  };

  const onChangeByPercent = (maxValue: number, percent: number) => {
    setAdditionalValue('');
    setInputValue(String(maxValue * (percent / 100)));
  };

  console.log('test: ', inputValue);

  return {
    onAddSymbol,
    onRemoveSymbol,
    onChangeByPercent,
    // full value for changing by percent
    inputValue: inputValue,
    // valut to show to user
    // formattedInputValue,
    additionalValue,
  };
};

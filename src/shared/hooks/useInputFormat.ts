import {useState} from 'react';

interface Params {
  maxValue?: number;
  saveOnButton?: boolean;
}

export const useInputFormat = (params?: Params) => {
  const maxValue = params?.maxValue;

  const [inputValue, setInputValue] = useState<string>('');
  // only for empty dot (amount).0)
  const [additionalValue, setAdditionalValue] = useState<string>('');

  const onAddSymbol = (symbol: string) => {
    if (inputValue.length > 10) {
      return;
    }
    setInputValue(prev => {
      const isPrevSymbolDot = !!additionalValue;
      const isDotSymbol = symbol === '.';

      if (maxValue && +`${prev}${symbol}` > maxValue) {
        return prev;
      }

      // we don't need two dots
      if (isDotSymbol && (prev.includes('.') || isPrevSymbolDot)) {
        return prev;
      }

      if (isDotSymbol && !prev) {
        setAdditionalValue('.0');
        return '0';
      }

      if (!prev && symbol === '0') {
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

  const onChangeByPercent = (max: number, percent: number) => {
    setAdditionalValue('');
    setInputValue(String(max * (percent / 100)));
  };

  const manualChangeValue = (value: string) => {
    setInputValue(value);
  };

  return {
    onAddSymbol,
    onRemoveSymbol,
    onChangeByPercent,
    manualChangeValue,
    inputValue: inputValue,
    additionalValue,
  };
};

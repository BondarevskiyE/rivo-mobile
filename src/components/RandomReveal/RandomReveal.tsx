import React from 'react';
// import LinearGradient from 'react-native-linear-gradient';
import {RandomReveal as RandomRevealComponent} from 'react-random-reveal';

const defaultDigitsCharactersSet = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
];

interface Props {
  value: string;
  charachtersSet?: string[];
}

export const RandomReveal: React.FC<Props> = ({
  value,
  charachtersSet = defaultDigitsCharactersSet,
}) => {
  return (
    <RandomRevealComponent
      key={value}
      isPlaying
      characterSet={charachtersSet}
      characters={value}
      revealDuration={0.8}
      duration={1.5}
    />
  );
};

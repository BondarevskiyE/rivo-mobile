import {Switch as NativeSwitch} from 'react-native';

import {Colors} from '@/shared/ui';

interface Props {
  onValueChange: (boolean: boolean) => void;
  value: boolean;
}

export const Switch: React.FC<Props> = ({onValueChange, value}) => {
  return (
    <NativeSwitch
      trackColor={{false: Colors.ui_grey_065, true: Colors.ui_orange_80}}
      thumbColor={Colors.ui_white}
      ios_backgroundColor={Colors.ui_grey_065}
      onValueChange={onValueChange}
      value={value}
    />
  );
};

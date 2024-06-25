import {Alert} from 'react-native';

interface Params {
  title: string;
  message: string;
  resolveButtonText: string;
  rejectButtonText: string;
}

export const AsyncAlert = async ({
  title,
  message,
  resolveButtonText,
  rejectButtonText,
}: Params) =>
  new Promise(resolve => {
    Alert.alert(
      title,
      message,
      [
        {
          text: resolveButtonText,
          onPress: () => {
            resolve(true);
          },
        },
        {
          text: rejectButtonText,
          onPress: () => {
            resolve(false);
          },
        },
      ],
      {cancelable: false},
    );
  });

import {Alert} from 'react-native';

interface Params {
  title: string;
  resolveButtonText: string;
  rejectButtonText: string;
  message?: string;
}

export const AsyncAlert = async ({
  title,
  message,
  resolveButtonText,
  rejectButtonText,
}: Params): Promise<boolean> =>
  new Promise(resolve => {
    Alert.alert(
      title,
      message,
      [
        {
          text: rejectButtonText,
          onPress: () => {
            resolve(false);
          },
        },
        {
          text: resolveButtonText,
          onPress: () => {
            resolve(true);
          },
        },
      ],
      {cancelable: false},
    );
  });

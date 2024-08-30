import {isIos} from '@/shared/helpers/system';
import {useAppState} from '@/shared/hooks';
import {Colors} from '@/shared/ui';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, StyleSheet} from 'react-native';

import {
  Camera,
  CameraRuntimeError,
  useCameraDevice,
  useCodeScanner,
} from 'react-native-vision-camera';

export interface ICameraScannerProps {
  onReadCode: (value: string) => void;
}

export const CameraScanner = ({onReadCode}: ICameraScannerProps) => {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [isCameraInitialized, setIsCameraInitialized] = useState(isIos);
  const [isActive, setIsActive] = useState(isIos);
  const [flash, setFlash] = useState<'on' | 'off'>(isIos ? 'off' : 'on');
  const {appState} = useAppState();
  const [codeScanned, setCodeScanned] = useState('');

  useEffect(() => {
    if (codeScanned) {
      onReadCode(codeScanned);
    }
  }, [codeScanned, onReadCode]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isCameraInitialized) {
      timeout = setTimeout(() => {
        setIsActive(true);
        setFlash('off');
      }, 1000);
    }
    setIsActive(false);
    return () => {
      clearTimeout(timeout);
    };
  }, [isCameraInitialized]);

  const onInitialized = () => {
    setIsCameraInitialized(true);
  };

  if (device == null) {
    Alert.alert('Error!', 'Camera could not be started');
  }

  const onError = (error: CameraRuntimeError) => {
    Alert.alert('Error!', error.message);
  };

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (codes.length > 0) {
        if (codes[0].value) {
          const value = codes[0].value.includes(':')
            ? codes[0].value.split(':')[1]
            : codes[0].value;

          setCodeScanned(value);
        }
      }
      return;
    },
  });

  if (device) {
    return (
      <Camera
        torch={flash}
        onInitialized={onInitialized}
        ref={camera}
        onError={onError}
        photo={false}
        style={styles.fullScreenCamera}
        device={device}
        codeScanner={codeScanner}
        isActive={isActive && appState === 'active' && isCameraInitialized}
      />
    );
  }
};

export const styles = StyleSheet.create({
  fullScreenCamera: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    zIndex: 9,
    backgroundColor: Colors.ui_black_90,
  },
});

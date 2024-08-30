import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {initialWindowMetrics} from 'react-native-safe-area-context';
import {RNHoleView} from 'react-native-hole-view';
import {RESULTS} from 'react-native-permissions';

import {CameraScanner} from './CameraScanner';
import {Colors, Fonts} from '@/shared/ui';
import {usePermissions, EPermissionTypes} from '@/shared/hooks/usePermissions';
import {ArrowLineIcon} from '@/shared/ui/icons';
import {CameraAngleIcon} from '@/shared/ui/icons/CameraAngleIcon';
import {GoToSettingsBanner} from './GoToSettingsBanner';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const CAMERA_HOLE_X_COORDINATE = SCREEN_WIDTH * 0.15;
const CAMERA_HOLE_Y_COORDINATE = SCREEN_HEIGHT * 0.35;
const CAMERA_HOLE_SIZE = SCREEN_WIDTH * 0.7;

const CAMERA_HOLE_ANGLE_PADDING = 20;

interface Props {
  onReadCode: (code: string) => void;
  onClose: () => void;
  title: string;
}

export const CameraScannerWrapper: React.FC<Props> = ({
  onReadCode,
  onClose,
  title,
}) => {
  const [isCameraShown, setIsCameraShown] = useState(false);

  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  const {askPermissions} = usePermissions(EPermissionTypes.CAMERA);

  const takePermissions = async () => {
    askPermissions()
      .then(response => {
        //permission given for camera
        if (
          response.type === RESULTS.LIMITED ||
          response.type === RESULTS.GRANTED
        ) {
          setIsCameraShown(true);
        }
      })
      .catch(error => {
        //permission is denied/blocked or camera feature not supported
        if ('isError' in error && error.isError) {
          Alert.alert(
            error.errorMessage ||
              'Something went wrong while taking camera permission',
          );
          onClose();
        }
        if ('type' in error) {
          if (error.type === RESULTS.UNAVAILABLE) {
            Alert.alert('This feature is not supported on this device');
            onClose();
          } else if (
            error.type === RESULTS.BLOCKED ||
            error.type === RESULTS.DENIED
          ) {
            setIsPermissionDenied(true);
          }
        }
      });
  };

  useEffect(() => {
    takePermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Modal presentationStyle="fullScreen" animationType="slide">
      {isCameraShown ? (
        <CameraScanner onReadCode={onReadCode} />
      ) : (
        <View style={styles.blackOverlay} />
      )}
      <RNHoleView
        holes={[
          {
            x: CAMERA_HOLE_X_COORDINATE,
            y: CAMERA_HOLE_Y_COORDINATE,
            width: CAMERA_HOLE_SIZE,
            height: CAMERA_HOLE_SIZE,
            borderRadius: 33,
          },
        ]}
        style={[styles.rnholeView]}>
        <View style={styles.headerContainer}>
          <Pressable onPress={onClose} style={styles.closeIconContainer}>
            <ArrowLineIcon
              style={{transform: [{rotate: '180deg'}]}}
              color={Colors.ui_white}
              width={12}
              height={12}
            />
          </Pressable>
          <Text style={styles.headerText}>{title}</Text>
        </View>
        <View
          style={{
            position: 'absolute',
            left: CAMERA_HOLE_X_COORDINATE - CAMERA_HOLE_ANGLE_PADDING,
            top: CAMERA_HOLE_Y_COORDINATE - CAMERA_HOLE_ANGLE_PADDING,
            width: CAMERA_HOLE_SIZE + CAMERA_HOLE_ANGLE_PADDING * 2,
            height: CAMERA_HOLE_SIZE + CAMERA_HOLE_ANGLE_PADDING * 2,
          }}>
          <CameraAngleIcon />
          <CameraAngleIcon
            style={[styles.absolute, styles.cameraAngleRightTop]}
          />
          <CameraAngleIcon
            style={[styles.absolute, styles.cameraAngleRightBottom]}
          />
          <CameraAngleIcon
            style={[styles.absolute, styles.cameraAngleLeftBottom]}
          />
        </View>
      </RNHoleView>
      {isPermissionDenied && (
        <View
          style={{
            position: 'absolute',
            left: CAMERA_HOLE_X_COORDINATE,
            top: CAMERA_HOLE_Y_COORDINATE,
            width: CAMERA_HOLE_SIZE,
            height: CAMERA_HOLE_SIZE,
          }}>
          <GoToSettingsBanner />
        </View>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  rnholeView: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    zIndex: 10,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  blackOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    backgroundColor: Colors.ui_black,
  },
  headerContainer: {
    position: 'absolute',
    width: '100%',
    height: 36,
    top: initialWindowMetrics?.insets.top,
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  headerText: {
    color: Colors.ui_white,
    fontFamily: Fonts.medium,
    fontSize: 16,
  },
  closeIconContainer: {
    position: 'absolute',
    left: 18,

    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.ui_grey_99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  absolute: {
    position: 'absolute',
  },
  cameraAngleRightTop: {
    top: 0,
    right: 0,
    transform: [
      {
        rotate: '90deg',
      },
    ],
  },
  cameraAngleRightBottom: {
    bottom: 0,
    right: 0,
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },
  cameraAngleLeftBottom: {
    bottom: 0,
    left: 0,
    transform: [
      {
        rotate: '270deg',
      },
    ],
  },
});

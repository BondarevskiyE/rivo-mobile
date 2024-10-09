import {useCallback} from 'react';
import {
  NotificationsResponse,
  PERMISSIONS,
  PermissionStatus,
  RESULTS,
  request,
  requestNotifications,
  check,
  checkNotifications,
} from 'react-native-permissions';
import {isIos, isAndroid} from '../helpers/system';
import {useSettingsStore} from '@/store/useSettingsStore';

export type TUsePermissionsReturnType = {
  isError?: boolean;
  type: (typeof RESULTS)[keyof typeof RESULTS];
  errorMessage?: string;
};

function isPushNotificationsResponse(
  response: NotificationsResponse | PermissionStatus,
): response is NotificationsResponse {
  return typeof response === 'object' && !!response.status;
}

export enum EPermissionTypes {
  CAMERA = 'camera',
  BIOMETRY = 'biometry',
  PUSH_NOTIFICATIONS = 'push_notifications',
}

export const usePermissions = (typeOfPermission: EPermissionTypes) => {
  const setIsSystemAlertOpen = useSettingsStore(
    state => state.setIsSystemAlertOpen,
  );

  const getPermission = useCallback(() => {
    //check if typeOfPermission exist in EPermissionTypes
    if (
      !typeOfPermission ||
      !Object.values(EPermissionTypes).includes(typeOfPermission)
    ) {
      throw new Error('Unsupported Type of permission.');
    }
    if (isIos) {
      switch (typeOfPermission) {
        case EPermissionTypes.CAMERA:
          return PERMISSIONS.IOS.CAMERA;
        case EPermissionTypes.BIOMETRY:
          return PERMISSIONS.IOS.FACE_ID;
        // there is independent method for requesting push notifications access
        case EPermissionTypes.PUSH_NOTIFICATIONS:
          return typeOfPermission;
      }
    }

    if (isAndroid) {
      switch (typeOfPermission) {
        case EPermissionTypes.CAMERA:
          return PERMISSIONS.ANDROID.CAMERA;
        case EPermissionTypes.BIOMETRY:
          return PERMISSIONS.ANDROID.BODY_SENSORS;
        // there is an independent method for requesting push notifications access
        case EPermissionTypes.PUSH_NOTIFICATIONS:
          return typeOfPermission;
      }
    }

    throw new Error('Unsupported Operating System.');
  }, [typeOfPermission]);

  const askPermissions =
    useCallback(async (): Promise<TUsePermissionsReturnType> => {
      // is is here to prevent passcode screen when we ask on android
      setIsSystemAlertOpen(true);
      return new Promise<TUsePermissionsReturnType>(async (resolve, reject) => {
        //ask permissions from user
        //if error present, return error
        try {
          const permissionType = getPermission();

          const requestPromise =
            permissionType === EPermissionTypes.PUSH_NOTIFICATIONS
              ? // there is independent method for requesting push notifications access
                requestNotifications(['alert', 'badge', 'sound'])
              : request(permissionType);

          await requestPromise.then(result => {
            setIsSystemAlertOpen(false);

            const status = isPushNotificationsResponse(result)
              ? result.status
              : result;

            switch (status) {
              case RESULTS.UNAVAILABLE:
                return reject({
                  type: RESULTS.UNAVAILABLE,
                });
              case RESULTS.DENIED:
                return reject({
                  type: RESULTS.DENIED,
                });
              case RESULTS.GRANTED:
                return resolve({
                  type: RESULTS.GRANTED,
                });
              case RESULTS.BLOCKED:
                return reject({
                  type: RESULTS.BLOCKED,
                });
              case RESULTS.LIMITED:
                return resolve({
                  type: RESULTS.LIMITED,
                });
            }
          });
        } catch (e: {data: {message: string | undefined}} | any) {
          return reject({
            isError: true,
            errorMessage:
              e?.data?.message ||
              e.message ||
              'Something went wrong while asking for permissions.',
          });
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getPermission]);

  const checkPermissions =
    useCallback(async (): Promise<TUsePermissionsReturnType> => {
      return new Promise<TUsePermissionsReturnType>(async (resolve, reject) => {
        //check permissions from user
        //if error present, return error
        try {
          const permissionType = getPermission();

          const checkPromise =
            permissionType === EPermissionTypes.PUSH_NOTIFICATIONS
              ? // there is independent method for checking push notifications access
                checkNotifications()
              : check(permissionType);

          await checkPromise.then(result => {
            const status = isPushNotificationsResponse(result)
              ? result.status
              : result;

            switch (status) {
              case RESULTS.UNAVAILABLE:
                return reject({
                  type: RESULTS.UNAVAILABLE,
                });
              case RESULTS.DENIED:
                return reject({
                  type: RESULTS.DENIED,
                });
              case RESULTS.GRANTED:
                return resolve({
                  type: RESULTS.GRANTED,
                });
              case RESULTS.BLOCKED:
                return reject({
                  type: RESULTS.BLOCKED,
                });
              case RESULTS.LIMITED:
                return resolve({
                  type: RESULTS.LIMITED,
                });
            }
          });
        } catch (e: {data: {message: string | undefined}} | any) {
          return reject({
            isError: true,
            errorMessage:
              e?.data?.message ||
              e.message ||
              'Something went wrong while checking permissions.',
          });
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getPermission]);

  return {
    askPermissions,
    checkPermissions,
  };
};

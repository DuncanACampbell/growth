import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

function resolveEasProjectId(): string {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (typeof projectId !== 'string' || projectId.trim().length === 0) {
    throw new Error(
      'EAS project ID is missing. Set extra.eas.projectId in app config.',
    );
  }

  return projectId;
}

/**
 * Requests notification permission (if needed) and returns an Expo push token.
 * Physical devices only — web and simulators throw a clear error.
 */
export async function registerForExpoPushNotifications(): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error(
      'Push notification registration is not available on web.',
    );
  }

  if (!Device.isDevice) {
    throw new Error(
      'Push notification registration requires a physical device (not a simulator).',
    );
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let status = existingStatus;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const projectId = resolveEasProjectId();
  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

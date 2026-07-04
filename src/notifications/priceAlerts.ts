import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady = Platform.OS !== 'android';

async function ensureAndroidChannel(): Promise<void> {
  if (channelReady) return;
  await Notifications.setNotificationChannelAsync('price-alerts', {
    name: '値下げ通知',
    importance: Notifications.AndroidImportance.HIGH,
  });
  channelReady = true;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    await ensureAndroidChannel();
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  if (requested.granted) {
    await ensureAndroidChannel();
  }
  return requested.granted;
}

export async function sendPriceAlertNotification(
  productTitle: string,
  price: number,
  shopName: string
): Promise<void> {
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'カウドキ！ 値下げ通知',
      body: `${productTitle}が¥${price.toLocaleString()}（${shopName}）になりました！`,
      sound: true,
    },
    trigger: null,
  });
}

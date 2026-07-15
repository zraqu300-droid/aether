import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export async function hapticImpact(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const impactStyle =
      style === 'light' ? ImpactStyle.Light :
      style === 'heavy' ? ImpactStyle.Heavy :
      ImpactStyle.Medium;
    await Haptics.impact({ style: impactStyle });
  } catch { /* haptics not available */ }
}

export async function hapticNotify(type: 'success' | 'warning' | 'error' = 'success') {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const notifType =
      type === 'warning' ? NotificationType.Warning :
      type === 'error' ? NotificationType.Error :
      NotificationType.Success;
    await Haptics.notification({ type: notifType });
  } catch { /* haptics not available */ }
}

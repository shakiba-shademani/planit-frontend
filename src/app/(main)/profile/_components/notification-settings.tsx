'use client';

import { useEffect, useState } from 'react';

import { Bell, BellOff } from 'lucide-react';

import {
  useDeletePushSubscription,
  useGetVapidPublicKey,
  useUpsertPushSubscription,
} from '@/hooks/apis/push';
import {
  getCurrentPushSubscription,
  getPushPermission,
  isPushSupported,
  subscribeToPush,
  subscriptionToPayload,
  unsubscribeFromPush,
} from '@/utils/web-push';

export function NotificationSettings() {
  const vapidQuery = useGetVapidPublicKey();
  const upsertMutation = useUpsertPushSubscription();
  const deleteMutation = useDeletePushSubscription();
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(
    'default'
  );
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function syncState() {
      const pushSupported = isPushSupported();
      if (!pushSupported) {
        if (!cancelled) {
          setSupported(false);
          setPermission('unsupported');
          setEnabled(false);
        }
        return;
      }

      const nextPermission = await getPushPermission();
      const subscription = await getCurrentPushSubscription();

      if (!cancelled) {
        setSupported(true);
        setPermission(nextPermission);
        setEnabled(Boolean(subscription) && nextPermission === 'granted');
      }
    }

    void syncState();

    return () => {
      cancelled = true;
    };
  }, []);

  async function enableNotifications() {
    setMessage('');
    setBusy(true);

    try {
      if (!vapidQuery.data?.publicKey || !vapidQuery.data.enabled) {
        throw new Error('Push notifications are not configured on the server');
      }

      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        throw new Error('Notification permission was denied');
      }

      const subscription = await subscribeToPush(vapidQuery.data.publicKey);
      await upsertMutation.mutateAsync(subscriptionToPayload(subscription));
      setEnabled(true);
      setMessage('Reminders enabled on this device.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not enable notifications');
      setEnabled(false);
    } finally {
      setBusy(false);
    }
  }

  async function disableNotifications() {
    setMessage('');
    setBusy(true);

    try {
      const subscription = await unsubscribeFromPush();
      if (subscription) {
        await deleteMutation.mutateAsync({ endpoint: subscription.endpoint });
      }
      setEnabled(false);
      setMessage('Reminders disabled on this device.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not disable notifications');
    } finally {
      setBusy(false);
    }
  }

  if (!supported) {
    return (
      <section className='mt-4 rounded-2xl border border-line bg-card p-4'>
        <h2 className='text-sm font-semibold'>Reminders</h2>
        <p className='mt-2 text-sm text-muted'>
          Web push is not supported in this browser.
        </p>
      </section>
    );
  }

  return (
    <section className='mt-4 rounded-2xl border border-line bg-card p-4'>
      <h2 className='text-sm font-semibold'>Reminders</h2>
      <p className='mt-1 text-sm text-muted'>
        Get a notification when a task reminder time arrives.
      </p>

      <button
        type='button'
        disabled={busy || vapidQuery.isLoading || !vapidQuery.data?.enabled}
        onClick={() => {
          void (enabled ? disableNotifications() : enableNotifications());
        }}
        className='mt-3 flex h-11 w-full items-center justify-between rounded-xl bg-background px-3 text-sm disabled:opacity-50'
      >
        <span>{enabled ? 'Reminders on' : 'Enable reminders'}</span>
        {enabled ? <Bell size={18} className='text-primary' /> : <BellOff size={18} />}
      </button>

      {permission === 'denied' ? (
        <p className='mt-2 text-xs text-red-500'>
          Notifications are blocked in browser settings.
        </p>
      ) : null}

      {message ? <p className='mt-2 text-xs text-muted'>{message}</p> : null}
    </section>
  );
}

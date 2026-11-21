import { axiosInstance } from '@/hooks/apis/api-config';

import type {
  DeletePushSubscriptionRequest,
  UpsertPushSubscriptionRequest,
  VapidPublicKeyResponse,
} from './types';

const ENDPOINT = '/push';

export async function getVapidPublicKey() {
  const { data } = await axiosInstance.get<VapidPublicKeyResponse>(
    `${ENDPOINT}/vapid-public-key`
  );
  return data;
}

export async function upsertPushSubscription(payload: UpsertPushSubscriptionRequest) {
  const { data } = await axiosInstance.post(`${ENDPOINT}/subscriptions`, payload);
  return data;
}

export async function deletePushSubscription(payload: DeletePushSubscriptionRequest) {
  const { data } = await axiosInstance.delete(`${ENDPOINT}/subscriptions`, {
    data: payload,
  });
  return data;
}

'use client';

import { useMutation, useQuery } from '@tanstack/react-query';

import {
  deletePushSubscription,
  getVapidPublicKey,
  upsertPushSubscription,
} from './service';
import type {
  DeletePushSubscriptionRequest,
  UpsertPushSubscriptionRequest,
  VapidPublicKeyResponse,
} from './types';

export const pushKeys = {
  all: ['push'] as const,
  vapid: ['push', 'vapid'] as const,
};

export function useGetVapidPublicKey() {
  return useQuery<VapidPublicKeyResponse, Error>({
    queryKey: pushKeys.vapid,
    queryFn: getVapidPublicKey,
  });
}

export function useUpsertPushSubscription() {
  return useMutation({
    mutationFn: (payload: UpsertPushSubscriptionRequest) => upsertPushSubscription(payload),
  });
}

export function useDeletePushSubscription() {
  return useMutation({
    mutationFn: (payload: DeletePushSubscriptionRequest) => deletePushSubscription(payload),
  });
}

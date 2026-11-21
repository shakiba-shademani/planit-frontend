export type VapidPublicKeyResponse = {
  publicKey: string | null;
  enabled: boolean;
};

export type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type UpsertPushSubscriptionRequest = {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string;
};

export type DeletePushSubscriptionRequest = {
  endpoint: string;
};

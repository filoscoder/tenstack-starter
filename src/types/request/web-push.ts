export interface WebPushSubscription {
  endpoint: string;
  keys: WebPushSubscriptionKeys;
  expirationTime?: number;
}

export interface WebPushUpdatableProps {
  keys: string;
  expirationTime?: number;
}

export interface WebPushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface WebPushPayload {
  title: string;
  body: string;
  tag?: string;
}

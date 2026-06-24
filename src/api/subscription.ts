import { apiCall } from "./apicall";

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export interface SubscriptionStatus {
  plan: "free" | "pro";
  status: "active" | "cancelled" | "past_due" | "expired";
  interval: string | null;
  currency: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
  hasPaystackSubscription: boolean;
  isTrial: boolean;
  limits: {
    maxCourses: number | null;
    chatMessagesPerDay: number | null;
    quizzesPerDay: number | null;
    quickChat: boolean;
    illustrations: boolean;
  };
  usage: {
    coursesUsed: number;
    chatMessagesToday: number;
    quizzesToday: number;
  };
}

export const fetchSubscription = (token: string): Promise<SubscriptionStatus> =>
  apiCall("/subscription", { headers: authHeaders(token) });

export const postInitiateUpgrade = (
  token: string,
  data: { interval: string; region: string; callbackUrl: string },
): Promise<{ authorizationUrl: string; reference: string }> =>
  apiCall("/subscription/upgrade", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

export const postCancelSubscription = (
  token: string,
): Promise<{ success: boolean; message: string; activeUntil: string | null }> =>
  apiCall("/subscription/cancel", {
    method: "POST",
    headers: authHeaders(token),
  });

export const verifyPayment = (
  token: string,
  reference: string,
): Promise<{ success: boolean; plan?: string; message?: string }> =>
  apiCall(`/subscription/verify?reference=${encodeURIComponent(reference)}`, {
    headers: authHeaders(token),
  });

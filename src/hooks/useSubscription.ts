import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import {
  fetchSubscription,
  postInitiateUpgrade,
  postCancelSubscription,
  verifyPayment,
} from "../api/subscription";

export function useSubscription() {
  const { getToken } = useAuth();
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const token = await getToken();
      return fetchSubscription(token!);
    },
  });
}

export function useInitiateUpgrade() {
  const { getToken } = useAuth();
  return useMutation({
    mutationFn: async (data: { interval: string; region: string; callbackUrl: string }) => {
      const token = await getToken();
      return postInitiateUpgrade(token!, data);
    },
    onSuccess: (data) => {
      window.location.href = data.authorizationUrl;
    },
    onError: () => {
      toast.error("Failed to initiate upgrade. Please try again.");
    },
  });
}

export function useCancelSubscription() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      return postCancelSubscription(token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription cancelled successfully.");
    },
    onError: () => {
      toast.error("Failed to cancel subscription.");
    },
  });
}

export function useVerifyPayment() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reference: string) => {
      const token = await getToken();
      return verifyPayment(token!, reference);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      if (data.success) {
        toast.success("Payment verified!");
      } else {
        toast.error(data.message || "Payment verification failed.");
      }
    },
    onError: () => {
      toast.error("Payment verification failed.");
    },
  });
}

import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function NetworkToast() {
  const wasOffline = useRef(false);

  useEffect(() => {
    const handleOffline = () => {
      wasOffline.current = true;
      toast.error("You're offline", {
        id: "network-status",
        description: "Check your internet connection. Changes won't be saved until you're back online.",
        duration: Infinity,
      });
    };

    const handleOnline = () => {
      if (wasOffline.current) {
        wasOffline.current = false;
        toast.success("Back online", {
          id: "network-status",
          description: "Your connection has been restored.",
          duration: 3000,
        });
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // If already offline on mount
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}

import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { useEffect } from "react";

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

export function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => {
        registration.update();
      }, UPDATE_CHECK_INTERVAL);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.success("App ready to work offline");
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast("New version available", {
        duration: Infinity,
        action: {
          label: "Reload",
          onClick: () => {
            updateServiceWorker(true);
            setNeedRefresh(false);
          },
        },
      });
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
}

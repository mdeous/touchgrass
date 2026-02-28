import { useRegisterSW } from "virtual:pwa-register/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEffect } from "react";

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000;

export function ReloadPrompt() {
  const { t } = useTranslation();
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
      toast.success(t("pwa.offlineReady"));
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady, t]);

  useEffect(() => {
    if (needRefresh) {
      toast(t("pwa.newVersion"), {
        duration: Infinity,
        action: {
          label: t("pwa.reload"),
          onClick: () => {
            updateServiceWorker(true);
            setNeedRefresh(false);
          },
        },
      });
    }
  }, [needRefresh, setNeedRefresh, updateServiceWorker, t]);

  return null;
}

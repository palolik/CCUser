import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../Provider/AuthProvider";
import { enablePush, isPushAvailable, onForegroundMessage, pushPermission, syncPushToken } from "./push";

const DISMISS_KEY = "pushPromptDismissed";
const PUSH_ROLES = ["client", "emp", "employee", "marketer"];
const TOAST_MS = 6000;

// Push notifications for logged-in clients and employees: registers this
// device when permission is already granted, offers an "Enable" prompt
// otherwise, and shows messages that arrive while the site is open.
const PushManager = () => {
  const { user, token } = useContext(AuthContext);
  const [showPrompt, setShowPrompt] = useState(false);
  const [toast, setToast] = useState(null);

  const eligible = Boolean(token && PUSH_ROLES.includes(user?.role?.toLowerCase()));

  useEffect(() => {
    if (!eligible) {
      setShowPrompt(false);
      return undefined;
    }

    let cancelled = false;
    let unsubscribe = () => {};

    (async () => {
      if (!(await isPushAvailable()) || cancelled) return;

      const permission = pushPermission();
      if (permission === "granted") syncPushToken(token);
      setShowPrompt(permission === "default" && !localStorage.getItem(DISMISS_KEY));

      const off = await onForegroundMessage((payload) => {
        const data = payload.data || {};
        setToast({
          title: payload.notification?.title || data.title || "Cloud Company",
          body: payload.notification?.body || data.message || data.body || "",
          url: data.url,
        });
      });
      if (cancelled) off();
      else unsubscribe = off;
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [eligible, token]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleEnable = async () => {
    await enablePush(token);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setShowPrompt(false);
  };

  // Only same-site links, so a message can't send users elsewhere.
  const openToast = () => {
    if (toast?.url) {
      try {
        const url = new URL(toast.url, window.location.origin);
        if (url.origin === window.location.origin) window.location.assign(url.href);
      } catch {
        // ignore malformed links
      }
    }
    setToast(null);
  };

  return (
    <>
      {showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-[60] bg-white border border-gray-200 shadow-lg rounded-xl p-4">
          <p className="font-semibold text-gray-900">Turn on notifications?</p>
          <p className="text-sm text-gray-600 mt-1">
            Get notified about new messages, tasks and project updates even when this tab is closed.
          </p>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={handleDismiss} className="px-3 py-1.5 text-sm rounded-lg text-gray-600 hover:bg-gray-100">
              Not now
            </button>
            <button onClick={handleEnable} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Enable
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          onClick={openToast}
          className="fixed top-4 right-4 left-4 sm:left-auto sm:w-80 z-[70] bg-white border border-gray-200 shadow-lg rounded-xl p-4 cursor-pointer"
        >
          <p className="font-semibold text-gray-900">{toast.title}</p>
          {toast.body && <p className="text-sm text-gray-600 mt-1">{toast.body}</p>}
        </div>
      )}
    </>
  );
};

export default PushManager;

// Firebase Cloud Messaging for logged-in clients and employees.
// The browser's FCM token is saved on the server (POST /push/device-token)
// so the server and CC Events can push to this device; logout removes it.
import { base_url } from "../../config/config";
import { firebaseConfig, FIREBASE_VAPID_KEY } from "../../config/firebase";

const SW_URL = "/firebase-messaging-sw.js";
// Own scope so the push worker never controls the site's pages.
const SW_SCOPE = "/firebase-cloud-messaging-push-scope";
const TOKEN_KEY = "pushToken";

let loading = null;

// Loads the Firebase SDK only in browsers that support push.
function loadMessaging() {
  if (!loading) {
    loading = (async () => {
      if (!FIREBASE_VAPID_KEY || typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
        return null;
      }
      const [{ initializeApp, getApps }, mod] = await Promise.all([
        import("firebase/app"),
        import("firebase/messaging"),
      ]);
      if (!(await mod.isSupported())) return null;
      const app = getApps()[0] || initializeApp(firebaseConfig);
      return { mod, messaging: mod.getMessaging(app) };
    })().catch((err) => {
      console.error("Firebase messaging unavailable:", err);
      return null;
    });
  }
  return loading;
}

export async function isPushAvailable() {
  return Boolean(await loadMessaging());
}

export const pushPermission = () => (typeof Notification === "undefined" ? "denied" : Notification.permission);

// Never prompts: returns null unless permission was already granted.
async function getPushToken() {
  const loaded = await loadMessaging();
  if (!loaded || pushPermission() !== "granted") return null;
  const serviceWorkerRegistration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
  return (await loaded.mod.getToken(loaded.messaging, { vapidKey: FIREBASE_VAPID_KEY, serviceWorkerRegistration })) || null;
}

// Save this device's token for the logged-in user.
export async function syncPushToken(authToken) {
  if (!authToken) return false;
  try {
    const token = await getPushToken();
    if (!token) return false;
    const res = await fetch(`${base_url}/push/device-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ token, platform: "web" }),
    });
    if (!res.ok) return false;
    localStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (err) {
    console.error("Push registration failed:", err);
    return false;
  }
}

// Ask for permission (call from a click) and register the device.
export async function enablePush(authToken) {
  if (!(await isPushAvailable())) return false;
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;
  return syncPushToken(authToken);
}

const withTimeout = (promise, ms) => Promise.race([promise, new Promise((resolve) => setTimeout(resolve, ms))]);

// On logout: stop pushes to this device. Each step is time-boxed so logout
// never hangs on the network.
export async function unregisterPush() {
  const token = localStorage.getItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  if (!token) return;
  await withTimeout(
    fetch(`${base_url}/push/device-token`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).catch(() => {}),
    3000
  );
  const loaded = await withTimeout(loadMessaging(), 3000);
  if (loaded) await withTimeout(loaded.mod.deleteToken(loaded.messaging).catch(() => {}), 3000);
}

// Messages that arrive while the site is open in the foreground.
export async function onForegroundMessage(callback) {
  const loaded = await loadMessaging();
  if (!loaded) return () => {};
  return loaded.mod.onMessage(loaded.messaging, callback);
}

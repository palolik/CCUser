/* global importScripts, firebase */
// Firebase Cloud Messaging service worker for background push.
// Config must match src/config/firebase.js.
const FIREBASE_VERSION = "13.0.0";
const config = {
  apiKey: "AIzaSyC4Kqqq6hMdg8XBudiOPeDUIyVSQXA1FHM",
  authDomain: "cloudcompany-dbc36.firebaseapp.com",
  projectId: "cloudcompany-dbc36",
  storageBucket: "cloudcompany-dbc36.firebasestorage.app",
  messagingSenderId: "591914584119",
  appId: "1:591914584119:web:2386faf825e424adb157b2",
};

// Registered before importScripts so it runs instead of Firebase's own click
// handler: focus an open tab and send it to the notification's page
// (same-origin only), or open a new tab.
self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data || {};
  const fcm = data.FCM_MSG || {};
  const target = (fcm.data && fcm.data.url) || data.url || (fcm.fcmOptions && fcm.fcmOptions.link) || "/";
  let url;
  try { url = new URL(target, self.location.origin); } catch { url = new URL("/", self.location.origin); }
  if (url.origin !== self.location.origin) url = new URL("/", self.location.origin);

  event.stopImmediatePropagation();
  event.notification.close();
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const tab = windows.find((c) => new URL(c.url).origin === self.location.origin);
    if (tab) {
      await tab.focus();
      if ("navigate" in tab) await tab.navigate(url.href).catch(() => {});
      return;
    }
    await self.clients.openWindow(url.href);
  })());
});

importScripts(
  `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app-compat.js`,
  `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-messaging-compat.js`
);

firebase.initializeApp(config);
const messaging = firebase.messaging();

// Messages with a `notification` block are shown by Firebase itself; only
// data-only messages need showing here.
messaging.onBackgroundMessage((payload) => {
  if (payload.notification) return;
  const data = payload.data || {};
  if (!data.title) return;
  self.registration.showNotification(data.title, {
    body: data.message || data.body || "",
    icon: "/assets/febicon.svg",
    data: { url: data.url || "/" },
  });
});

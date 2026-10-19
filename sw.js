// FreshQA Stock - service worker: shows "Talabat finished" notifications,
// even when the site is closed or the phone is locked.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  const tag = d.tag || 'freshqa';
  e.waitUntil((async () => {
    // If the open page already showed this one, replace it quietly instead of alerting twice.
    const existing = await self.registration.getNotifications({ tag });
    await self.registration.showNotification(d.title || 'FreshQA Stock', {
      body: d.body || '',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag,
      renotify: existing.length === 0,
      data: { url: d.url || './' },
    });
  })());
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const w of wins) {
      if (w.url.startsWith(self.registration.scope)) { await w.focus(); return; }
    }
    await self.clients.openWindow(target);
  })());
});

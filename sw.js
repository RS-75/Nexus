// Service worker de Nexus : reçoit les notifications push et ouvre la bonne conversation au toucher.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch (_) {}
  // Toujours afficher une notification : Safari révoque l'abonnement sinon.
  e.waitUntil(self.registration.showNotification(d.title || 'Nexus', {
    body: d.body || '',
    icon: 'apple-touch-icon.png',
    badge: 'apple-touch-icon.png',
    tag: d.channel || 'nexus',
    renotify: true,
    data: { channel: d.channel || null }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const ch = e.notification.data && e.notification.data.channel;
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (list.length) {
      const c = list[0];
      await c.focus();
      if (ch) c.postMessage({ channel: ch });
      return;
    }
    await self.clients.openWindow('./' + (ch ? '?c=' + encodeURIComponent(ch) : ''));
  })());
});

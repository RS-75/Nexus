// Service worker Nexus : affiche les notifications push et ouvre la bonne conversation au toucher
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data.json(); } catch { d = { title: 'Nexus', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Nexus', {
    body: d.body || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: d.channel || undefined,
    renotify: !!d.channel,
    data: { channel: d.channel || '' }
  }));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const ch = (e.notification.data && e.notification.data.channel) || '';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs.find(x => 'focus' in x);
    if (c) { c.postMessage({ channel: ch }); return c.focus(); }
    return self.clients.openWindow('./' + (ch ? '?c=' + encodeURIComponent(ch) : ''));
  }));
});

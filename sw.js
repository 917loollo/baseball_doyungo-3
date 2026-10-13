/* DOYUNGO LIVE 서비스 워커: 푸시 알림 수신 */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (_) { d = { title: 'DOYUNGO LIVE', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'DOYUNGO LIVE', { body: d.body || '', icon: '/icon-192.png', badge: '/icon-192.png', tag: d.tag, renotify: true, data: { url: d.url || '/' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => { for (const c of l) if ('focus' in c) return c.focus(); return clients.openWindow((e.notification.data && e.notification.data.url) || '/'); }));
});

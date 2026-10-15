// Never cache account, menu API, or order responses. Offline orders are not queued.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
 if(event.request.mode==='navigate')event.respondWith(fetch(event.request).catch(()=>new Response('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>FOOD — Offline</title><body style="background:#fbf9f3;color:#24362c;font:18px system-ui;padding:10vh 8vw"><h1>You’re offline.</h1><p>Reconnect to browse the current menu and place an order.</p><button onclick="location.reload()">Try again</button></body></html>',{headers:{'Content-Type':'text/html; charset=utf-8'}})));
});

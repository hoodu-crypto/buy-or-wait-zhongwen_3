self.addEventListener("push", event => {
  const {body,tag} = event.data.json();
  event.waitUntil(self.registration.showNotification("BUY OR WAIT?", {body,tag}));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = self.registration.scope;
  event.waitUntil((async () => {
    const windows = await clients.matchAll({type:"window",includeUncontrolled:true});
    const app = windows.find(w => w.url.startsWith(url));
    if (app) return app.focus();
    return clients.openWindow(url);
  })());
});

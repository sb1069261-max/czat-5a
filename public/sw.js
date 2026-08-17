// Service Worker - działa w tle, nawet gdy aplikacja jest zamknięta
self.addEventListener('push', function(event) {
    let data = { title: 'Nowa wiadomość', body: 'Ktoś do Ciebie napisał!' };
    
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/icon.png', // Upewnij się, że masz taką ikonę lub zmień ścieżkę
        badge: '/icon.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'chat-notification',
        requireInteraction: true, // Wisi na zablokowanym ekranie, dopóki nie klikniesz
        actions: [
            { action: 'open', title: 'Otwórz czat' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Obsługa kliknięcia w powiadomienie (przenosi do aplikacji)
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/'); // Otwiera stronę główną apki
        })
    );
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const webpush = require('web-push');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

// Pamięć historii i subskrypcji na serwerze
let chatHistory = [];
let pushSubscriptions = [];
const room = 'main-chat';

io.on('connection', (socket) => {
    socket.join(room);

    // Wysyłamy aktualną historię nowo połączonemu użytkownikowi
    socket.emit('history', chatHistory);

    socket.on('join-room', () => {
        socket.join(room);
    });

    socket.on('message', (data) => {
        const messageWithTime = {
            text: data.text,
            author: data.author || 'Kolega', // Zapisuje Twój nick lub domyślny
            userId: data.userId || null,     // Zapisuje unikalne ID urządzenia
            timestamp: Date.now()
        };

        chatHistory.push(messageWithTime);

        // Limit do 100 wiadomości w historii
        if (chatHistory.length > 100) {
            chatHistory.shift();
        }

        // Wysyłamy nową wiadomość do wszystkich
        io.to(room).emit('message', messageWithTime);

        // Automatyczne usuwanie wiadomości po godzinie (3600000 ms)
        setTimeout(() => {
            chatHistory = chatHistory.filter(m => m.timestamp !== messageWithTime.timestamp);
            // Wysyłamy odświeżoną historię po usunięciu
            io.to(room).emit('history', chatHistory);
        }, 3600000);

        // Obsługa powiadomień WebPush
        const payload = JSON.stringify({
            title: 'Nowa wiadomość',
            body: data.text
        });

        pushSubscriptions.forEach(sub => {
            webpush.sendNotification(sub, payload).catch(err => console.error(err));
        });
    });
});

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    pushSubscriptions.push(subscription);
    res.status(201).json({ message: 'Subskrypcja zapisana' });
});

// Uruchomienie serwera
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

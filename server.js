const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

// Tablica z historią
let chatHistory = [];

io.on('connection', (socket) => {
    // 1. Wysyłamy historię do każdego, kto się połączy
    socket.emit('history', chatHistory);

    socket.on('message', (data) => {
        const messageObj = {
            text: data.text,
            id: Date.now()
        };

        chatHistory.push(messageObj);

        // Limit do 100 wiadomości
        if (chatHistory.length > 100) chatHistory.shift();

        // Wysyłamy nową wiadomość do wszystkich
        io.emit('message', messageObj);

        // Usuwanie po godzinie
        setTimeout(() => {
            chatHistory = chatHistory.filter(msg => msg.id !== messageObj.id);
            // Wysyłamy odświeżoną historię do wszystkich
            io.emit('history', chatHistory);
        }, 3600000); // 3600000 ms = 1 godzina
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));

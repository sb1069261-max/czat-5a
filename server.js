const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Wspólna historia wiadomości dla wszystkich
let chatHistory = [];

io.on('connection', (socket) => {
  // Każdy kto wchodzi, automatycznie dołącza do 'main-chat'
  socket.join('main-chat');

  // Wysyłamy nowemu użytkownikowi całą historię
  socket.emit('history', chatHistory);

  socket.on('message', (data) => {
    // Dodajemy do historii
    chatHistory.push(data);
    
    // Utrzymujemy tylko ostatnią godzinę (np. max 100 wiadomości lub usuwanie po czasie)
    if (chatHistory.length > 100) chatHistory.shift();

    // Rozsyłamy do wszystkich
    io.to('main-chat').emit('message', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let chatHistory = [];

io.on('connection', (socket) => {
  // Każdy użytkownik trafia automatycznie do pokoju 'main-chat'
  socket.join('main-chat');

  // Wysyłamy historię wiadomości
  socket.emit('history', chatHistory);

  // Obsługa dołączania do pokoju (dla kompatybilności)
  socket.on('join-room', (room) => {
    socket.join('main-chat');
  });

  // Obsługa wiadomości
  socket.on('message', (data) => {
    chatHistory.push(data);
    if (chatHistory.length > 100) {
      chatHistory.shift();
    }
    io.to('main-chat').emit('message', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

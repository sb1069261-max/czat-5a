const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let chatHistory = [];

io.on('connection', (socket) => {
  // Wszyscy od razu lądują w jednym, stałym pokoju 'main-chat'
  const room = 'main-chat';
  socket.join(room);

  // Wysyłamy nowej osobie całą historię czatu
  socket.emit('history', chatHistory);

  // Jeśli klient próbuje dołączyć do pokoju, wrzucamy go do głównego
  socket.on('join-room', () => {
    socket.join(room);
  });

  // Odbieranie i rozsyłanie wiadomości do wszystkich
  socket.on('message', (data) => {
    chatHistory.push(data);
    if (chatHistory.length > 100) {
      chatHistory.shift();
    }
    io.to(room).emit('message', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  // Dołączanie do konkretnego pokoju
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  // Przekazywanie wiadomości do WSZYSTKICH INNYCH w tym samym pokoju
  socket.on('chat-message', (data) => {
    socket.to(data.room).emit('chat-message', data);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('encrypted-message', (data) => {
    // Serwer tylko przekazuje zaszyfrowaną wiadomość do osób w tym samym pokoju
    io.to(data.roomId).emit('encrypted-message', data.payload);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

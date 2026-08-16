const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  // Klient dołącza do konkretnego pokoju (np. na podstawie hasha lub ogólnego pokoju)
  socket.on('join-room', (room) => {
    socket.join(room);
  });

  // Odbieranie i rozsyłanie wiadomości zero-knowledge (serwer widzi tylko zaszyfrowane paczki)
  socket.on('message', (data) => {
    // Jeśli używasz pokoi, rozsyłaj do pokoju, w przeciwnym razie broadcast do wszystkich
    if (data.room) {
      io.to(data.room).emit('message', data);
    } else {
      io.broadcast.emit('message', data); // Wysyłamy do innych
      socket.emit('message', data);       // Oraz z powrotem do nadawcy, żeby pojawiła się na ekranie!
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

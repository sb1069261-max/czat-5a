const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Pamięć na wiadomości w pokojach
const roomsHistory = {};

const MESSAGE_TTL = 60 * 60 * 1000; // 1 godzina w milisekundach

io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    // Czyścimy wygasłe wiadomości przed wysłaniem historii
    const now = Date.now();
    if (roomsHistory[roomId]) {
      roomsHistory[roomId] = roomsHistory[roomId].filter(msg => (now - msg.timestamp) < MESSAGE_TTL);
      
      // Wysyłamy historię wiadomości nowo połączonemu użytkownikowi
      socket.emit('load-history', roomsHistory[roomId]);
    } else {
      roomsHistory[roomId] = [];
    }
  });

  socket.on('chat-message', (data) => {
    const msgData = {
      text: data.text,
      timestamp: Date.now(),
      id: Math.random().toString(36).substring(2, 9)
    };

    if (!roomsHistory[data.room]) {
      roomsHistory[data.room] = [];
    }
    roomsHistory[data.room].push(msgData);

    // Przekazujemy wiadomość do reszty osób w pokoju
    socket.to(data.room).emit('chat-message', msgData);

    // Automatyczne usuwanie tej wiadomości z pamięci serwera po 1 godzinie
    setTimeout(() => {
      if (roomsHistory[data.room]) {
        roomsHistory[data.room] = roomsHistory[data.room].filter(m => m.id !== msgData.id);
      }
    }, MESSAGE_TTL);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Przechowujemy historię ostatnich wiadomości w pamięci serwera
let chatHistory = [];

io.on('connection', (socket) => {
  // Każdy użytkownik automatycznie trafia do stałego pokoju 'main-chat'
  socket.join('main-chat');

  // Wysyłamy nowemu użytkownikowi dotychczasową historię czatu
  socket.emit('history', chatHistory);

  socket.on('message', (data) => {
    // Dodajemy wiadomość do historii
    chatHistory.push(data);
    
    // Ograniczamy historię do ostatnich 100 wiadomości, żeby nie zająć całej pamięci
    if (chatHistory.length > 100) {
      chatHistory.shift();
    }

    // Przesyłamy wiadomość do wszystkich w pokoju 'main-chat'
  
  socket.on('join-room', (room) => {
    // Ignorujemy stare hashe z linków i zawsze trzymamy każdego w 'main-chat'
    socket.join('main-chat');
  });
    io.to('main-chat').emit('message', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

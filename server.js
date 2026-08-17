
let pushSubscriptions = []; // Tutaj będziemy trzymać subskrypcje urządzeń
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

 socket.on('message', (data) => {
    chatHistory.push(data);
    if (chatHistory.length > 100) {
        chatHistory.shift();
    }
    io.to(room).emit('message', data);

    const payload = JSON.stringify({
        title: `Nowa wiadomość od: ${data.sender || 'Ktoś'}`,
        body: data.text || 'Otrzymałeś nową wiadomość!'
    });

    pushSubscriptions.forEach(sub => {
        webpush.sendNotification(sub, payload).catch(err => console.error(err));
    });
});
});
// Endpoint do rejestrowania subskrypcji push
app.post('/subscribe', express.json(), (req, res) => {
    const subscription = req.body;
    pushSubscriptions.push(subscription);
    res.status(201).json({ message: 'Subskrypcja dodana pomyślnie!' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const webpush = require('web-push');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

let chatHistory = [];
let pushSubscriptions = [];
const room = 'main-chat';

io.on('connection', (socket) => {
    socket.join(room);

    socket.emit('history', chatHistory);

    socket.on('join-room', () => {
        socket.join(room);
    });

    socket.on('message', (data) => {
        const messageWithTime = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            text: data.text || null,
            audioData: data.audioData || null,
            type: data.type || 'text',
            author: data.author || 'Kolega',
            userId: data.userId || null,
            timestamp: Date.now(),
            reactions: {}
        };

        chatHistory.push(messageWithTime);

        if (chatHistory.length > 100) {
            chatHistory.shift();
        }

        io.to(room).emit('message', messageWithTime);

        setTimeout(() => {
            chatHistory = chatHistory.filter(m => m.id !== messageWithTime.id);
            io.to(room).emit('history', chatHistory);
        }, 3600000);

        if (data.text) {
            const payload = JSON.stringify({
                title: 'Nowa wiadomość',
                body: data.text
            });

            pushSubscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload).catch(err => console.error(err));
            });
        }
    });

    // KLUCZOWE: Obsługa reakcji na serwerze
    socket.on('react-message', ({ messageId, emoji, userId }) => {
        const msg = chatHistory.find(m => m.id === messageId);
        if (msg) {
            if (!msg.reactions) msg.reactions = {};
            
            if (msg.reactions[userId] === emoji) {
                delete msg.reactions[userId];
            } else {
                msg.reactions[userId] = emoji;
            }

            io.to(room).emit('message-reaction-updated', {
                messageId: msg.id,
                reactions: msg.reactions
            });
        }
    });
});

app.post('/subscribe', (req, res) => {
    const subscription = req.body;
    pushSubscriptions.push(subscription);
    res.status(201).json({ message: 'Subskrypcja zapisana' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

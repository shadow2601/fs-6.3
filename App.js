// app.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let messages = [];

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Real-Time Chat</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        #chat { border: 1px solid #ccc; height: 300px; overflow-y: scroll; padding: 10px; margin-bottom: 10px; background: #fafafa }
        #name, #msg { width: 60%; padding: 5px; margin-bottom: 5px; }
        #send { padding: 5px 10px; }
      </style>
    </head>
    <body>
      <h2>Real-Time Chat</h2>
      <input id="name" placeholder="Enter your name" /><br/>
      <div id="chat"></div>
      <form id="form">
        <input id="msg" autocomplete="off" placeholder="Type your message..." />
        <button id="send">Send</button>
      </form>
      <script src="https://cdn.socket.io/4.5.1/socket.io.min.js"></script>
      <script>
        const socket = io();
        const chat = document.getElementById('chat');
        const form = document.getElementById('form');
        const msg = document.getElementById('msg');
        const name = document.getElementById('name');

        function appendMessage(data) {
          const div = document.createElement('div');
          div.innerHTML = '<strong>' + data.user + '</strong> [' + data.time + ']: ' + data.text;
          chat.appendChild(div);
          chat.scrollTop = chat.scrollHeight;
        }

        socket.on('messages', msgs => {
          chat.innerHTML = '';
          msgs.forEach(appendMessage);
        });

        form.addEventListener('submit', function(e) {
          e.preventDefault();
          if (!name.value || !msg.value) return;
          socket.emit('send_message', {
            user: name.value,
            text: msg.value,
            time: new Date().toLocaleTimeString()
          });
          msg.value = '';
        });
      </script>
    </body>
    </html>
  `);
});

io.on('connection', (socket) => {
  socket.emit('messages', messages);
  socket.on('send_message', (data) => {
    messages.push(data);
    io.emit('messages', messages);
  });
});

server.listen(5000, () => {
  console.log('Server is running at http://localhost:5000');
});

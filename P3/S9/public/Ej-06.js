const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const PUERTO = 8080;
const app = express();


app.use(express.static(path.join(__dirname, 'public')));


const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

// WebSocket funcional
wsServer.on('connection', socket => {
  console.log("Cliente conectado por WebSocket");

  socket.on('message', msg => {
    console.log("Mensaje recibido:", msg.toString());
    socket.send("Eco: " + msg);
  });
});

server.listen(PUERTO, () => {
  console.log("Servidor escuchando en puerto:", PUERTO);
});

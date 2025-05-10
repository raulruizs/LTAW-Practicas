const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const PUERTO = 8080;
const app = express();

// Sirve automáticamente archivos de la carpeta 'public'
app.use(express.static('public'));

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

wsServer.on('connection', socket => {
  console.log("Cliente WebSocket conectado");

  socket.on('message', message => {
    console.log("Mensaje recibido:", message.toString());
    socket.send("Eco: " + message);
  });

  socket.on('close', () => {
    console.log("Cliente desconectado");
  });
});

server.listen(PUERTO, () => {
  console.log("Escuchando en puerto:", PUERTO);
});

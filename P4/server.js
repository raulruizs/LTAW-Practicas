// server.js
const socketServer = require('socket.io').Server;
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const io = new socketServer(server);
const PUERTO = 8080;
const Fecha = new Date();

let win = null; // se asignará desde main.js

app.get('/', (req, res) => res.redirect("/chat.html"));
app.use('/', express.static(__dirname +'/'));
app.use(express.static('public'));

function startServer(ventanaElectron) {
  win = ventanaElectron;

  io.on('connection', (socket) => {
    console.log('** NUEVA CONEXIÓN **');
    socket.emit("message", "🔔 Un nuevo usuario se ha unido al chat");

    win.webContents.send("usuarios", io.engine.clientsCount);

    socket.on("message", (data) => {
      console.log("Mensaje Recibido!: " + data);

      if (data.endsWith("/")) {
        socket.send("Esperando comando. Usa /help");
      } else if (data.includes("/help")) {
        socket.send("Comandos disponibles: /list, /hello, /date");
      } else if (data.includes("/list")) {
        socket.send("Hay " + io.engine.clientsCount + " clientes conectados");
      } else if (data.includes("/hello")) {
        socket.send("Hola! Bienvenido al chat!!");
      } else if (data.includes("/date")) {
        socket.send("Fecha: " + Fecha.toLocaleDateString());
      } else {
        io.send(data);
        win.webContents.send("msg_client", data);
      }
    });

    socket.on('typing', (nick) => {
      socket.broadcast.emit('typing', nick);
    });

    socket.on('disconnect', () => {
      console.log('** CONEXIÓN TERMINADA **');
      win.webContents.send("usuarios", io.engine.clientsCount);
    });
  });

  server.listen(PUERTO, () => {
    console.log("Servidor escuchando en puerto: " + PUERTO);
  });
}

module.exports = {
  startServer,
  PORT: PUERTO
};

const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const PUERTO = 8080; 


//-- Crear una aplicación web vacia
const app = express();

//-- Asociar el servidor http con la app de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const wsServer = new WebSocketServer({server});
const path = require('path');

// Sirve test.html cuando se accede a /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);
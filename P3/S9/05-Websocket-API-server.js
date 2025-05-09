const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const PUERTO = 8080; 


//-- Crear una aplicación web vacia
const app = express();

//-- Asociar el servidor http con la app de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const wsServer = new WebSocketServer({httpServer: server});

//-- Lanzar el servidor HTTP
//-- ¡Que empiecen los juegos de los WebSockets!
server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);
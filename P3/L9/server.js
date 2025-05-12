//-- Cargar las dependencias
const socketServer = require('socket.io').Server;
const http = require('http');
const express = require('express');
const colors = require('colors');
const PUERTO = 8080;
const Fecha = new Date();

//-- Crear una nueva aplciacion web
const app = express();

//-- Crear un servidor, asosiaco a la App de express
const server = http.Server(app);

//-- Crear el servidor de websockets, asociado al servidor http
const io = new socketServer(server);

//-- Definir el punto de entrada principal de mi aplicación web
app.get('/', (req, res) => {
    res.redirect("/chat.html");
});

//-- Esto es necesario para que el servidor le envíe al cliente la
//-- biblioteca socket.io para el cliente
app.use('/', express.static(__dirname +'/'));

//-- El directorio publico contiene ficheros estáticos
app.use(express.static('public'));

//------------------- GESTION SOCKETS IO
//-- Evento: Nueva conexión recibida
io.on('connect', (socket) => {

    console.log('** NUEVA CONEXIÓN **'.yellow);
    
    //mando un mensaje de bienvenida unicamente al usuario que se ha conectado
    socket.emit("message", "🔔 Un nuevo usuario se ha unido al chat");
    
    //-- Evento de desconexión
    socket.on('disconnect', function(){
      console.log('** CONEXIÓN TERMINADA **'.yellow);
    });  
  
    //-- Mensaje recibido, dependiendo de que se recibe se hace cada cosa
    socket.on("message", (data)=> {
      console.log("Mensaje Recibido!: " + data);
    if (data.endsWith("/")){
        socket.send("Esperando a recibir comando, si quiere consultar los comandos disponibles utilice: /help")
    }else if (data.split("/")[1] == 'help') {
        socket.send("Comandos Disponibles: /list, /hello, /date");
    } else if(data.split("/")[1] == 'list') {
        socket.send("Hay " + io.engine.clientsCount + " clientes conectados");
    }else if(data.split("/")[1] == 'hello'){
        socket.send('Hola! Bienvenido al chat!!')
    }else if (data.split("/")[1] == 'date'){
        socket.send("Fecha: " + Fecha.toLocaleDateString());
    }else{
        io.send(data);
    }
    });
  });

server.listen(PUERTO);
console.log("Escuchando en puerto: " + PUERTO);
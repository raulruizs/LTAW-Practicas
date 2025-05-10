const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path'); 

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;


const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Ruta para enviar el archivo HTML al cliente
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'public.html'));
});
let contador = 0
function aumentar() { contador += 1; };
function disminuir() { contador -= 1; };
// Evento de conexión de un cliente
io.on('connection', (socket) => {
    console.log('Nuevo usuario conectado');
    aumentar();
    // Mensaje de bienvenida al nuevo usuario
    socket.emit('message', { sender: 'Servidor', content: 'Bienvenido al chat!' });

    // Anunciar a los demás usuarios que alguien nuevo se ha conectado
    socket.broadcast.emit('message', { sender: 'Servidor', content: '¡Un nuevo usuario se ha conectado!' });

   
    socket.on('message', (message) => {
        console.log('Mensaje recibido: ', message);

        // Verificar si el mensaje es un comando especial
        if (message.content.startsWith('/')) {
            handleCommand(message.content, socket);
        } else {
            // Reenviar el mensaje a todos los clientes
            io.emit('message', message);
        }
    });

    // Manejo de desconexión de un cliente
    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
        disminuir()
    });
});

// Función para manejar los comandos especiales
function handleCommand(message, socket) {
    switch (message) {
        case '/help':
            socket.emit('message', { sender: 'Servidor', content: 'Lista de comandos disponibles:' });
            socket.emit('message', { sender: 'Servidor', content: '/help - Muestra esta lista de comandos' });
            socket.emit('message', { sender: 'Servidor', content: '/list - Devuelve el número de usuarios conectados' });
            socket.emit('message', { sender: 'Servidor', content: '/hello - El servidor devuelve un saludo' });
            socket.emit('message', { sender: 'Servidor', content: '/date - Devuelve la fecha actual' });
            break;
        case '/list':
            const numUsers = Object.keys(io.sockets.sockets).length;
            socket.emit('message', { sender: 'Servidor', content: `Número de usuarios conectados: ${contador}` });
            break;
        case '/hello':
            socket.emit('message', { sender: 'Servidor', content: 'Hola! ¿Cómo estás?' });
            break;
        case '/date':
            const currentDate = new Date().toDateString();
            socket.emit('message', { sender: 'Servidor', content: `Fecha actual: ${currentDate}` });
            break;
        default:
            socket.emit('message', { sender: 'Servidor', content: 'Comando no reconocido. Para ver la lista de comandos, escriba /help' });
            break;
    }
}

// Iniciar el servidor
server.listen(PORT, () => {
    console.log(`Servidor de chat iniciado en el puerto ${PORT}`);
});
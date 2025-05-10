const socket = io();

const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const messagesContainer = document.getElementById('messages-container');

// Mostrar el mensaje en el chat
function showMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <div class="sender">${message.sender}</div>
        <div class="content">${message.content}</div>
    `;
    messagesContainer.appendChild(messageElement);
}

// Enviar el mensaje al servidor cuando se envíe el formulario
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    if (message.trim() !== '') {
        socket.emit('message', { sender: username, content: message });
        messageInput.value = '';
    }
});

// Escuchar mensajes del servidor y mostrarlos en el chat
socket.on('message', (message) => {
    showMessage(message);
});

// Capturar el nombre del usuario al conectarse al chat
const username = prompt('Ingresa tu nombre');
if (username) {
    socket.emit('username', username);
}
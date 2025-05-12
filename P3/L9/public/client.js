// client.js
const socket = io();
const messagesDiv = document.getElementById('messages');
const typingDiv   = document.getElementById('typing-indicator');
const msgInput    = document.getElementById('msg_entry');
const sendBtn     = document.getElementById('send-btn');
const audio       = document.getElementById('msg-sound');

const username = localStorage.getItem('username') || prompt('Tu nickname:');
if (!localStorage.getItem('username')) {
  localStorage.setItem('username', username);
}

// Avisamos al servidor de nuestro nickname
socket.emit('join', username);

// Habilitar botón sólo si hay texto
msgInput.addEventListener('input', () => {
  sendBtn.disabled = !msgInput.value.trim();
  socket.emit('typing', msgInput.value.trim() ? username : null);
});

// Enviar mensaje
sendBtn.addEventListener('click', () => {
  const text = msgInput.value.trim();
  if (!text) return;
  socket.emit('message', { from: username, text });
  msgInput.value = '';
  sendBtn.disabled = true;
  socket.emit('typing', null);
});

// Recibir mensaje
socket.on('message', ({ from, text }) => {
  const div = document.createElement('div');
  div.classList.add('message');
  if (from === username) div.classList.add('self');
  div.textContent = `${from}: ${text}`;
  messagesDiv.append(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  if (from !== username) audio.play().catch(()=>{});
});

// Recibir typing
socket.on('typing', (who) => {
  typingDiv.textContent = who ? `${who} está escribiendo…` : '';
});

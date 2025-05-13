// 1) Referencias al DOM y audio
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const usernameInput = document.getElementById("username");
const typingIndicator = document.getElementById("typing-indicator");
const msgSound = document.getElementById("msg-sound");

// 2) Conexión Socket.IO
const socket = io();

// 3) Indicador “escribiendo…”
msg_entry.addEventListener('input', () => {
  // Cada vez que el usuario escribe algo
  const nick = localStorage.getItem('username');
  socket.emit('typing', nick || null);
});

// 4) Escuchar eventos “typing” del servidor
socket.on('typing', (who) => {
  typingIndicator.textContent = who
    ? `${who} está escribiendo…`
    : '';
});

// 5) Recibir mensajes y reproducir sonido
socket.on("message", (msg) => {
  msgSound.currentTime = 0;
  msgSound.play().catch(() => {});

  display.innerHTML += '<p style="color:blue">' + msg + '</p>';
  display.scrollTop = display.scrollHeight;
});

// 6) Enviar mensaje al cambiar el campo (o con Enter)
msg_entry.addEventListener('change', () => {
  if (msg_entry.value) {
    const message = msg_entry.value.trim();
    const username = usernameInput.value.trim();
    if (username && message) {
      socket.send(username + ": " + message);
    } else {
      alert("Por favor, introduce tu nombre de usuario y un mensaje válido.");
    }
  }
  msg_entry.value = "";
  // Al enviar, avisamos que hemos dejado de escribir:
  socket.emit('typing', null);
});

// 1) Referencias al DOM y audio
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const usernameInput = document.getElementById("username");
const typingIndicator = document.getElementById("typing-indicator");
const msgSound = document.getElementById("msg-sound");
const sendBtn = document.getElementById("send_btn");

// 2) Conexión Socket.IO
const socket = io();

// 3) Indicador “escribiendo…”
msg_entry.addEventListener('input', () => {
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

  const p = document.createElement("p");
  p.textContent = msg;

  // Diferenciar mensaje propio
  const username = usernameInput.value.trim();
  if (msg.startsWith(username + ":")) {
    p.classList.add("self");
  }

  display.appendChild(p);
  display.scrollTop = display.scrollHeight;
});

// 6) Función para enviar mensaje
function enviarMensaje() {
  const message = msg_entry.value.trim();
  const username = usernameInput.value.trim();
  if (username && message) {
    socket.send(username + ": " + message);
    msg_entry.value = "";
    socket.emit('typing', null);
  } else {
    alert("Introduce un nombre de usuario y un mensaje válido.");
  }
}

// 7) Enviar con botón
sendBtn.addEventListener('click', enviarMensaje);

// 8) Enviar con Enter
msg_entry.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    enviarMensaje();
  }
});

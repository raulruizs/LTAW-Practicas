// al principio de client.js
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const usernameInput = document.getElementById("username");

// REFERENCIA AL AUDIO
const msgSound = document.getElementById("msg-sound");

// Conexión socket
const socket = io();

// Mostrar mensajes y sonar
socket.on("message", (msg) => {
  // Reproducir sonido (solo si viene de otro usuario)
  // Opcionalmente podrías comprobar que msg no incluya tu propio nickname
  msgSound.currentTime = 0;
  msgSound.play().catch(() => {});

  // Mostrar en pantalla
  display.innerHTML += '<p style="color:blue">' + msg + '</p>';
});

// resto de tu client.js igual...
msg_entry.onchange = () => {
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
};


//-- Elementos del interfaz
const display = document.getElementById("display");
const msg_entry = document.getElementById("msg_entry");
const usernameInput = document.getElementById("username");

//-- Crear un websocket. Se establece la conexión con el servidor
const socket = io();


socket.on("message", (msg)=>{
  display.innerHTML += '<p style="color:blue">' + msg + '</p>';
});

//-- Al apretar el botón se envía un mensaje al servidor
msg_entry.onchange = () => {
  if (msg_entry.value) {
    const message = msg_entry.value.trim();
    const username = usernameInput.value.trim();
    if (username && message) {
      socket.send(username + ": " + message); // Envía nombre de usuario junto con el mensaje
    } else {
      alert("Por favor, introduce tu nombre de usuario y un mensaje válido.");
    }
  }
   
  //-- Borrar el mensaje actual
  msg_entry.value = "";
}

window.addEventListener('DOMContentLoaded', () => {
  const spanNode = document.getElementById("v-node");
  const spanChrome = document.getElementById("v-chrome");
  const spanElectron = document.getElementById("v-electron");
  const spanUsuarios = document.getElementById("usuarios");
  const aUrl = document.getElementById("url-cliente");
  const mensajesDiv = document.getElementById("mensajes");

  window.api.onVersionInfo((info) => {
    spanNode.textContent = info.node;
    spanChrome.textContent = info.chrome;
    spanElectron.textContent = info.electron;
    spanUsuarios.textContent = "0";
    aUrl.href = info.url;
    aUrl.textContent = info.url;
  });

  window.api.onUserCount((count) => {
    spanUsuarios.textContent = count;
  });

  window.api.onMessage((msg) => {
    const p = document.createElement('p');
    p.innerText = msg;
    mensajesDiv.appendChild(p);
  });
});

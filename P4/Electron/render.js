// renderer.js
window.addEventListener('DOMContentLoaded', () => {
  window.api.onVersionInfo((info) => {
    document.getElementById("v-node").textContent = info.node;
    document.getElementById("v-chrome").textContent = info.chrome;
    document.getElementById("v-electron").textContent = info.electron;
    document.getElementById("url-cliente").textContent = info.url;
    document.getElementById("url-cliente").href = info.url;
  });

  window.api.onUserCount((count) => {
    document.getElementById("usuarios").textContent = count;
  });

  window.api.onMessage((msg) => {
    const p = document.createElement("p");
    p.innerText = msg;
    document.getElementById("display").appendChild(p);
  });
});

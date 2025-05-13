const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  onVersionInfo: (cb) => ipcRenderer.on('version-info', (_, info) => cb(info)),
  onUserCount: (cb) => ipcRenderer.on('usuarios', (_, count) => cb(count)),
  onMessage: (cb) => ipcRenderer.on('msg_client', (_, msg) => cb(msg)),
  sendTestMessage: (msg) => ipcRenderer.invoke('mensaje-prueba', msg)
});

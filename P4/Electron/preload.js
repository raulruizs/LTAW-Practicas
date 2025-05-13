const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    onVersionInfo: (callback) => ipcRenderer.on('version-info', (event, data) => callback(data))
});
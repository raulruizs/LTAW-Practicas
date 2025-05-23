const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const { startServer, PORT, io } = require('./server');

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('version-info', {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      url: `http://${getLocalIP()}:${PORT}/index.html`
    });
  });

  startServer(win); // arrancar el servidor pasando la ventana
  ipcMain.handle('mensaje-prueba', (event, mensaje) => {
    console.log("Mensaje de prueba enviado desde interfaz:", mensaje);
    io.send(mensaje); // Se envía a todos los clientes conectados
});

}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

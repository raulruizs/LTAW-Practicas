// Práctica 1 - Crear una aplicación web que sea una tienda on-line. 
// Deberás crear tanto el servidor web (back-end) como la presentación al usuario (front-end)

const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 8001;

//-- Crear el servidor
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = '.index.html';
    }
    
    const extname = path.extname(filePath).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif'
    }[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                fs.readFile('./404.html', (err, errorContent) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(errorContent || 'Error 404 - Página no encontrada', 'utf-8');
                });
            } else {
                res.writeHead(500);
                res.end(`Error interno del servidor: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});
    
server.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
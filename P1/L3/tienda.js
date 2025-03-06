const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = 8001;

// Página de error personalizada
const pag_error = fs.readFileSync('./404.html');

// Función para leer archivos y devolver la respuesta
function leerArchivo(filePath, contentType, res) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.log(`Error al leer el archivo: ${filePath}`); // Añadido para debug
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(pag_error);  // Mostrar error directamente en el cuerpo de la respuesta
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Crear el servidor
const server = http.createServer((req, res) => {
    // Analizar la URL solicitada (ya no es necesario require('url'))
    const url = new URL(req.url, `http://${req.headers.host}`);
    let filePath = '.' + url.pathname;

    // Si la ruta es la raíz, cargamos el archivo index.html
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'imagenes/webp'
    }[extname] || 'application/octet-stream';

    // Manejo de diferentes tipos de archivos
    if (extname === '.css') {
        leerArchivo(filePath, 'text/css', res);
    } else if (extname === '.html' || extname === '.js' || extname === '.jpg' || extname === '.jpeg' || extname === '.png' || extname === '.gif' || extname === '.webp') {
        leerArchivo(filePath, contentType, res);
    } else {
        // Si el archivo solicitado no tiene una extensión válida
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(pag_error);  // Mostrar error directamente en el cuerpo de la respuesta
    }
});

// Escuchar en el puerto definido
server.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

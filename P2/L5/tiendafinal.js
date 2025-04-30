const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 8001;
const DATA_FILE = './tienda.json';

// Función para leer tienda.json
function leerBaseDatos(callback) {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer tienda.json:', err);
            callback(null);
        } else {
            try {
                const jsonData = JSON.parse(data);
                callback(jsonData);
            } catch (error) {
                console.error('Error al analizar tienda.json:', error);
                callback(null);
            }
        }
    });
}

// Función para leer archivos y responder
function leerArchivo(filePath, contentType, res) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Página no encontrada</h1>');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

// Crear servidor
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);

    if (req.method === 'GET' && parsedUrl.pathname === '/login') {
        const query = querystring.parse(parsedUrl.query);
        const username = query.username;
    
        leerBaseDatos((data) => {
            if (data) {
                const usuario = data.usuarios.find(u => u.nombre === username);
                if (usuario) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, usuario }));
                } else {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Usuario no encontrado' }));
                }
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Error en la base de datos' }));
            }
        });

    } else if (req.method === "GET" && parsedUrl.pathname === "/finalizar-compra") {
        const query = querystring.parse(parsedUrl.query);

        const nuevoPedido = {
            usuario: "prueba", // temporal, ya que aún no tenemos autenticación completa
            direccion: query.direccion,
            tarjeta: query.tarjeta,
            productos: [] // se completará en ejercicios posteriores
        };

        leerBaseDatos((data) => {
            if (data) {
                data.pedidos.push(nuevoPedido);

                fs.writeFile(DATA_FILE, JSON.stringify(data, null, 4), (err) => {
                    if (err) {
                        res.writeHead(500, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ mensaje: "Error al guardar el pedido" }));
                    } else {
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ mensaje: "✅ Pedido realizado con éxito." }));
                    }
                });
            } else {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ mensaje: "Error al acceder a la base de datos" }));
            }
        });

    } else if (parsedUrl.pathname === '/usuarios') {
        leerBaseDatos((data) => {
            if (data) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data.usuarios));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al leer la base de datos' }));
            }
        });
    } else if (parsedUrl.pathname === '/productos') {
        leerBaseDatos((data) => {
            if (data) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data.productos));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al leer la base de datos' }));
            }
        });
    } else if (parsedUrl.pathname === '/pedidos') {
        leerBaseDatos((data) => {
            if (data) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(data.pedidos));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error al leer la base de datos' }));
            }
        });
    } else {
        // Manejo de archivos estáticos
        let filePath = '.' + parsedUrl.pathname;
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
            '.webp': 'image/webp',
        }[extname] || 'application/octet-stream';

        leerArchivo(filePath, contentType, res);
    }
});


// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});

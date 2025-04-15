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
    const parsedUrl = url.parse(req.url, true); // true para parsear query directamente

    // LOGIN GET (nuevo)
    if (req.method === 'GET' && parsedUrl.pathname === '/login') {
        const username = parsedUrl.query.username;

        fs.readFile('./login.html', 'utf8', (err, loginHtml) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>Error al cargar la página de login</h1>');
                return;
            }

            leerBaseDatos((data) => {
                if (data) {
                    const usuario = data.usuarios.find(u => u.nombre === username);
                    let mensajeHTML;

                    if (usuario) {
                        mensajeHTML = `<h2>✅ Bienvenido, ${usuario.nombre_real}.</h2>`;
                    } else {
                        mensajeHTML = `<h2 style="color:red;">❌ Usuario no reconocido.</h2>
                                       <a href="login.html">Intentar de nuevo</a>`;
                    }

                    const paginaFinal = loginHtml.replace('HTML_MENSAJE', mensajeHTML);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(paginaFinal);
                } else {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<h2>Error accediendo a la base de datos</h2>');
                }
            });
        });

    // Finalizar compra (igual que antes)
    } else if (req.method === "POST" && parsedUrl.pathname === "/finalizar-compra") {
        let body = "";
        
        req.on("data", chunk => { body += chunk; });

        req.on("end", () => {
            let datosPedido = JSON.parse(body);

            leerBaseDatos((data) => {
                if (data) {
                    data.pedidos.push({
                        usuario: datosPedido.usuario,
                        direccion: datosPedido.direccion,
                        tarjeta: datosPedido.tarjeta,
                        productos: datosPedido.productos
                    });

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
        });

    // Otros endpoints JSON (igual que antes)
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

    // Archivos estáticos (igual que antes)
    } else {
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

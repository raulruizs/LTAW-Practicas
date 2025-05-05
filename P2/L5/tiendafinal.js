const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');
const PORT = 8001;
const DATA_FILE = './tienda.json';

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

function leerCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        cookies[key] = decodeURIComponent(value);
    });
    return cookies;
}

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

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);

    if (req.method === 'GET' && parsedUrl.pathname === '/login') {
        const cookies = leerCookies(req.headers.cookie);
        if (cookies.user) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Ya estás dentro</title>
                    <link rel="stylesheet" href="/login.css">
                </head>
                <body>
                    <div class="login-container">
                        <h1>🔒 Ya has iniciado sesión</h1>
                        <p>Hola, ${cookies.user}. Ya estás logeado.</p>
                        <a href="/index.html" class="volver-tienda">Ir a la tienda</a>
                    </div>
                </body>
                </html>
            `);
            return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Iniciar sesión</title>
                <link rel="stylesheet" href="/login.css">
            </head>
            <body>
                <div class="login-container">
                    <h1>Iniciar sesión</h1>
                    <form action="/login" method="POST">
                        <label for="username">Usuario:</label>
                        <input type="text" id="username" name="username" required>
                        <button type="submit">Iniciar sesión</button>
                    </form>
                </div>
            </body>
            </html>
        `);

    } else if (req.method === 'POST' && parsedUrl.pathname === '/login') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            const { username } = querystring.parse(body);
            leerBaseDatos((data) => {
                if (data) {
                    const usuario = data.usuarios.find(u => u.nombre === username);
                    if (usuario) {
                        res.writeHead(302, {
                            'Location': '/index.html',
                            'Set-Cookie': `user=${encodeURIComponent(username)}; Path=/; HttpOnly; Max-Age=3600`,
                            'Content-Type': 'text/html'
                        });
                        res.end();
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Usuario no encontrado' }));
                    }
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Error en la base de datos' }));
                }
            });
        });

    } else if (req.method === 'GET' && parsedUrl.pathname === '/index.html') {
        const cookies = leerCookies(req.headers.cookie);
        const usuario = cookies.user;

        leerBaseDatos((data) => {
            if (!data) {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h2>Error al cargar productos</h2>');
                return;
            }

            const productosHTML = data.productos.map(p => `
                <div class="producto">
                    <h3>${p.nombre}</h3>
                    <p>${p.descripcion}</p>
                    <p><strong>$${p.precio}</strong></p>
                </div>
            `).join('');

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <!DOCTYPE html>
                <html lang="es">
                <head>
                    <meta charset="UTF-8">
                    <title>Tienda Principal</title>
                    <link rel="stylesheet" href="/index.css">
                    <style>
                        .producto {
                            border: 1px solid #ccc;
                            padding: 10px;
                            margin: 10px;
                            border-radius: 8px;
                            background-color: #f9f9f9;
                        }
                    </style>
                </head>
                <body>
                    <header>
                        <h1>Tienda Online</h1>
                        ${
                            usuario
                                ? `<p>Hola, <strong>${usuario}</strong></p>`
                                : `<a href="/login">Iniciar sesión</a>`
                        }
                    </header>
                    <main>
                        <h2>Bienvenido a nuestra tienda</h2>
                        <div class="productos">
                            ${productosHTML}
                        </div>
                    </main>
                </body>
                </html>
            `);
        });

    } else if (parsedUrl.pathname === '/finalizar-compra') {
        const query = querystring.parse(parsedUrl.query);
        const nuevoPedido = {
            usuario: "prueba",  // Temporal
            direccion: query.direccion,
            tarjeta: query.tarjeta,
            productos: []
        };

        leerBaseDatos((data) => {
            if (data) {
                data.pedidos.push(nuevoPedido);
                fs.writeFile(DATA_FILE, JSON.stringify(data, null, 4), (err) => {
                    if (err) {
                        res.writeHead(500, { "Content-Type": "text/html" });
                        res.end("<h2>Error al guardar el pedido.</h2>");
                    } else {
                        res.writeHead(200, { "Content-Type": "text/html" });
                        res.end(`
                            <!DOCTYPE html>
                            <html lang="es">
                            <head>
                                <meta charset="UTF-8">
                                <title>Compra realizada</title>
                                <link rel="stylesheet" href="/finalizar.css">
                            </head>
                            <body>
                                <div class="mensaje-exito">
                                    <h1>✅ Pedido realizado con éxito</h1>
                                    <p>Gracias por tu compra.</p>
                                    <a class="volver-tienda" href="/index.html">← Volver a la tienda</a>
                                </div>
                            </body>
                            </html>
                        `);
                    }
                });
            } else {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end("<h2>Error al acceder a la base de datos.</h2>");
            }
        });

    } else {
        let filePath = '.' + parsedUrl.pathname;
        if (filePath === './') {
            res.writeHead(302, { Location: '/index.html' });
            res.end();
            return;
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

server.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});

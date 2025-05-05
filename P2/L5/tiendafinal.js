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

// Función para leer cookies de la cabecera 'Cookie'
function leerCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        cookies[key] = decodeURIComponent(value);
    });
    return cookies;
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

    // Página principal con login dinámico
    if (req.method === 'GET' && parsedUrl.pathname === '/index.html') {
        const cookies = leerCookies(req.headers.cookie);
        const usuario = cookies.user;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Tienda Principal</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <header>
                    <h1>Bienvenido a la Tienda</h1>
                    ${
                        usuario
                            ? `<p>Hola, <strong>${usuario}</strong> | <a href="/logout">Cerrar sesión</a></p>`
                            : `<a href="/login">Iniciar sesión</a>`
                    }
                </header>
                <main>
                    <h2>Productos destacados</h2>
                    <p>(Aquí iría el contenido de la tienda)</p>
                </main>
            </body>
            </html>
        `);
    }

    // Ruta para login (GET)
    else if (req.method === 'GET' && parsedUrl.pathname === '/login') {
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
    }

    // Ruta para procesar login (POST)
    else if (req.method === 'POST' && parsedUrl.pathname === '/login') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

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
    }

    // Ruta para logout
    else if (req.method === 'GET' && parsedUrl.pathname === '/logout') {
        res.writeHead(302, {
            'Location': '/index.html',
            'Set-Cookie': 'user=; Max-Age=0; Path=/; HttpOnly'
        });
        res.end();
    }

    // Finalizar compra
    else if (parsedUrl.pathname === '/finalizar-compra') {
        const query = querystring.parse(parsedUrl.query);
        const nuevoPedido = {
            usuario: "prueba",
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
    }

    // Archivos estáticos
    else {
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

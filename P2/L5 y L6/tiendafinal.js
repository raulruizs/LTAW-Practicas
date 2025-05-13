const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = 8001;
const DATA_FILE = './tienda.json';

// Leer base de datos
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

// Leer cookies
function leerCookies(cookieHeader) {
    const cookies = {};
    if (!cookieHeader) return cookies;
    cookieHeader.split(';').forEach(cookie => {
        const [key, value] = cookie.trim().split('=');
        cookies[key] = decodeURIComponent(value);
    });
    return cookies;
}

// Leer archivos
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

    // Página de login
if (req.method === 'GET' && parsedUrl.pathname === '/login') {
    const cookies = leerCookies(req.headers.cookie);

    if (cookies.user) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Ya estás logeado</title>
                <link rel="stylesheet" href="/login.css">
            </head>
            <body>
                <div class="login-container">
                    <h1>🔒 Ya has iniciado sesión</h1>
                    <p>Hola, ${cookies.user}.</p>
                    <a href="/index.html" class="volver-tienda">Ir a la tienda</a>
                </div>
            </body>
            </html>
        `);
        return;
    }

    // Si NO está logueado, solo leemos el archivo, sin volver a escribir cabecera
    leerArchivo('./login.html', 'text/html', res);
    return;
}


    // Procesar login
    else if (req.method === 'POST' && parsedUrl.pathname === '/login') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const postData = querystring.parse(body);
            const username = postData.username;

            leerBaseDatos(data => {
                if (data) {
                    const usuario = data.usuarios.find(u => u.nombre === username);
                    if (usuario) {
                        res.writeHead(200, {
                            'Set-Cookie': `user=${encodeURIComponent(username)}; Path=/; HttpOnly; Max-Age=3600`,
                            'Content-Type': 'application/json'
                        });
                        res.end(JSON.stringify({ success: true, usuario }));
                    } else {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Usuario no encontrado' }));
                    }
                } else {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Error en base de datos' }));
                }
            });
        });
    }

    // Añadir producto al carrito (con acumulación)
    else if (req.method === 'GET' && parsedUrl.pathname === '/anadir-carrito') {
        const query = querystring.parse(parsedUrl.query);
        const nombre = query.nombre;
        const precio = parseFloat(query.precio);
        const cookies = leerCookies(req.headers.cookie);
    
        let carrito = [];
        if (cookies.carrito) {
            try {
                carrito = JSON.parse(cookies.carrito);
            } catch {
                carrito = [];
            }
        }
    
        // Solo verificar si existe el producto (sin tocar stock real)
        leerBaseDatos(data => {
            if (!data) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Error al leer la base de datos' }));
                return;
            }
    
            const producto = data.productos.find(p => p.nombre === nombre);
            if (!producto || producto.stock <= 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Producto sin stock' }));
                return;
            }
    
            carrito.push({ nombre, precio });
    
            res.writeHead(200, {
                'Set-Cookie': `carrito=${encodeURIComponent(JSON.stringify(carrito))}; Path=/; Max-Age=3600`,
                'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({ success: true, mensaje: 'Producto añadido al carrito' }));
        });
    }
    else if (parsedUrl.pathname === '/buscar-productos') {
        const myURL = new URL(req.url, 'http://' + req.headers['host']);
        const param1 = myURL.searchParams.get('param1').toLowerCase();
    
        leerBaseDatos(data => {
            if (!data || !data.productos) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify([]));
                return;
            }
    
            const resultados = data.productos
                .map(p => p.nombre)
                .filter(nombre => nombre.toLowerCase().startsWith(param1));
    
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resultados));
        });
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
                        res.end(`<html><body><h1>✅ Pedido realizado</h1><a href="/index.html">Volver a la tienda</a></body></html>`);
                    }
                });
            } else {
                res.writeHead(500, { "Content-Type": "text/html" });
                res.end("<h2>Error al acceder a la base de datos.</h2>");
            }
        });
    }

    // Página principal (con usuario)
    else {
        let filePath = '.' + parsedUrl.pathname;
        if (filePath === './' || filePath === './index.html') {
            const cookies = leerCookies(req.headers.cookie);
            const username = cookies.user;
            const mensajeUsuario = username
                ? `<div id="usuarioInfo">👤 Conectado como: <strong>${username}</strong></div>`
                : `<div id="usuarioInfo"><a href="/login" style="color: yellow;">🔐 Iniciar sesión</a></div>`;

            fs.readFile('./index.html', 'utf8', (err, contenido) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end('<h1>Error al cargar index.html</h1>');
                } else {
                    const contenidoPersonalizado = contenido.replace('<!--LOGIN_PLACEHOLDER-->', mensajeUsuario);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(contenidoPersonalizado, 'utf-8');
                }
            });
            return;
        }

        // Archivos estáticos
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

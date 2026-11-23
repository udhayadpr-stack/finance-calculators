// Local-only server for exercising the actual Expo static export in browser tests.
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const mime = {'.js':'text/javascript', '.html':'text/html', '.css':'text/css', '.json':'application/json', '.png':'image/png', '.ttf':'font/ttf'};
http.createServer(async (request, response) => {
    try {
        const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
        const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
        if (!filename.startsWith(root + path.sep)) throw new Error('Invalid path');
        const data = await fs.readFile(filename);
        response.writeHead(200, {'Content-Type': mime[path.extname(filename)] || 'application/octet-stream'});
        response.end(data);
    } catch {
        response.writeHead(404);
        response.end('Not found');
    }
}).listen(4185, '127.0.0.1');

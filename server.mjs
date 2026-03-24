import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.resolve(__dirname);

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
};

function resolvePath(urlPath) {
    const raw = decodeURIComponent(urlPath.split('?')[0]);
    const rel = raw === '/' || raw === '' ? 'index.html' : raw.replace(/^\//, '');
    if (rel.includes('\0') || rel.includes('..')) return null;
    const fp = path.resolve(ROOT, rel);
    const relToRoot = path.relative(ROOT, fp);
    if (relToRoot.startsWith('..') || path.isAbsolute(relToRoot)) return null;
    return fp;
}

const server = http.createServer((req, res) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.writeHead(405);
        return res.end();
    }
    const fp = resolvePath(req.url);
    if (!fp) {
        res.writeHead(400);
        return res.end();
    }
    fs.stat(fp, (err, st) => {
        if (err || !st.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end('Not found');
        }
        const ext = path.extname(fp).toLowerCase();
        res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
        if (req.method === 'HEAD') return res.end();
        fs.createReadStream(fp).pipe(res);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Static server at http://0.0.0.0:${PORT} (root: ${ROOT})`);
});

/**
 * vite-shared-storage.js
 * Plugin de Vite que agrega endpoints API al dev server
 * para sincronizar localStorage entre navegadores.
 * 
 * Almacena los datos en un archivo JSON en disco.
 * Cuando un navegador escribe, el dato se guarda en el servidor.
 * Todos los navegadores consultan periódicamente los cambios.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '.shared-storage.json');

function readData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        }
    } catch (e) {
        console.warn('[SharedStorage] Error reading data:', e.message);
    }
    return {};
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.warn('[SharedStorage] Error writing data:', e.message);
    }
}

// Track last-modified timestamp for efficient polling
let lastModified = Date.now();

export default function sharedStoragePlugin() {
    return {
        name: 'shared-storage',
        configureServer(server) {
            // Middleware to parse JSON body
            const parseBody = (req) => {
                return new Promise((resolve) => {
                    let body = '';
                    req.on('data', chunk => body += chunk);
                    req.on('end', () => {
                        try { resolve(JSON.parse(body)); }
                        catch { resolve({}); }
                    });
                });
            };

            const setCorsHeaders = (res) => {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            };

            // GET /__shared_storage__/all — devuelve todos los datos
            server.middlewares.use('/__shared_storage__/all', (req, res, next) => {
                if (req.method === 'OPTIONS') { setCorsHeaders(res); res.end(); return; }
                if (req.method !== 'GET') return next();

                setCorsHeaders(res);
                const data = readData();
                res.end(JSON.stringify({ data, lastModified }));
            });

            // GET /__shared_storage__/timestamp — solo el timestamp para polling eficiente
            server.middlewares.use('/__shared_storage__/timestamp', (req, res, next) => {
                if (req.method !== 'GET') return next();
                setCorsHeaders(res);
                res.end(JSON.stringify({ lastModified }));
            });

            // POST /__shared_storage__/set — escribe una key
            server.middlewares.use('/__shared_storage__/set', async (req, res, next) => {
                if (req.method === 'OPTIONS') { setCorsHeaders(res); res.end(); return; }
                if (req.method !== 'POST') return next();

                setCorsHeaders(res);
                const body = await parseBody(req);
                const { key, value } = body;

                if (!key) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'key is required' }));
                    return;
                }

                const data = readData();
                data[key] = value;
                writeData(data);
                lastModified = Date.now();

                res.end(JSON.stringify({ ok: true, lastModified }));
            });

            // POST /__shared_storage__/remove — borra una key
            server.middlewares.use('/__shared_storage__/remove', async (req, res, next) => {
                if (req.method === 'OPTIONS') { setCorsHeaders(res); res.end(); return; }
                if (req.method !== 'POST') return next();

                setCorsHeaders(res);
                const body = await parseBody(req);
                const { key } = body;

                if (!key) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'key is required' }));
                    return;
                }

                const data = readData();
                delete data[key];
                writeData(data);
                lastModified = Date.now();

                res.end(JSON.stringify({ ok: true, lastModified }));
            });

            // POST /__shared_storage__/bulk — escribe múltiples keys de una vez
            server.middlewares.use('/__shared_storage__/bulk', async (req, res, next) => {
                if (req.method === 'OPTIONS') { setCorsHeaders(res); res.end(); return; }
                if (req.method !== 'POST') return next();

                setCorsHeaders(res);
                const body = await parseBody(req);
                const { items } = body; // { key: value, key2: value2, ... }

                if (!items) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'items is required' }));
                    return;
                }

                const data = readData();
                Object.assign(data, items);
                writeData(data);
                lastModified = Date.now();

                res.end(JSON.stringify({ ok: true, lastModified }));
            });

            console.log('\n  🔄 SharedStorage plugin activo — datos sincronizados entre navegadores\n');
        }
    };
}

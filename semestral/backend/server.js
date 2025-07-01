import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Agrega esto ANTES de las rutas
fastify.register(import('@fastify/static'), {
  root: path.join(__dirname, '../../frontend'),
  prefix: '/'
});
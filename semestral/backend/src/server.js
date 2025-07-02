// Contenido corregido mostrado arriba
import Fastify from 'fastify';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { config } from './config/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fastify = Fastify({ 
  logger: true 
});

// Configuración básica
await fastify.register(import('@fastify/cors'), {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

await connectDB();

// Registro de rutas
fastify.register(import('./routes/auth'), { prefix: '/api/auth' });

// Ruta de salud
fastify.get('/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// Iniciar servidor
const start = async () => {
  try {
    await fastify.listen({ 
      port: config.PORT,
      host: '0.0.0.0'
    });
    console.log(`🚀 Servidor listo en http://localhost:${config.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
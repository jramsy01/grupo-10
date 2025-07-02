import { Fastify } from 'fastify';
import { User } from '../models/User.js';


export async function authRoutes(fastify) {
  fastify.post('/register', async (request, reply) => {
    // Lógica de registro
  });

  fastify.post('/login', async (request, reply) => {
    // Lógica de login
  });

// Ejemplo de uso en un controlador
const newUser = new User({
  email: 'usuario@ejemplo.com',
  password: 'contraseñaSegura123',
  username: 'nombreusuario'
});
}

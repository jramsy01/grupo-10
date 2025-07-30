import { login } from '../controllers/authController.js';

export async function authRoutes(fastify) {
  fastify.post('/login', login);
}
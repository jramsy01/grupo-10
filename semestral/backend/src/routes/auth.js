import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export default async function (fastify, opts) {
  // Registro de usuario
  fastify.post('/register', async (request, reply) => {
    const { email, password, username } = request.body;

    try {
      const user = new User({ email, password, username });
      await user.save();

      const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
        expiresIn: '1d',
      });

      return reply.code(201).send({
        message: 'Usuario creado correctamente',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
        token,
      });
    } catch (error) {
      return reply.code(400).send({ error: error.message });
    }
  });

  // Inicio de sesión
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return reply.code(404).send({ error: 'Usuario no encontrado' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return reply.code(401).send({ error: 'Contraseña incorrecta' });
      }

      const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
        expiresIn: '1d',
      });

      return {
        message: 'Inicio de sesión exitoso',
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
        token,
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Error del servidor' });
    }
  });
}

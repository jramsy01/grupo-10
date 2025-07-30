import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';

export const login = async (req, reply) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return reply.code(401).send({ error: "Usuario no encontrado" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return reply.code(401).send({ error: "Contraseña incorrecta" });

  const token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '1h' });
  reply.send({ token });
};
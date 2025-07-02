import dotenv from 'dotenv';
dotenv.config();

export const config = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/domino-dash',
  JWT_SECRET: process.env.JWT_SECRET || 'secret-key',
  PORT: process.env.PORT || 3000
};

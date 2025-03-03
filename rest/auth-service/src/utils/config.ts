import dotenv from 'dotenv';
import { Algorithm } from 'jsonwebtoken';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    accessToken: {
      secret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      algorithm: (process.env.JWT_ALGORITHM || 'HS256') as Algorithm,
    },
    refreshToken: {
      secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },
}; 
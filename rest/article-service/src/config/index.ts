import dotenv from 'dotenv';

dotenv.config();

export const config = {
  authService: {
    url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3000'
  },
}; 
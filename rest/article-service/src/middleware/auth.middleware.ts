import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/authRequest';
import { config } from '../config';
import logger from '../utils/logger';
import axios from 'axios';

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: 'No authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    try {
      const response = await axios.get(
        `${config.authService.url}/api/auth/users/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      req.user = {
        id: response.data.id,
        email: response.data.email,
        username: response.data.username,
        roles: response.data.roles
      };

      next();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          res.status(401).json({ message: 'Invalid or expired token' });
          return;
        }
        if (error.response?.status === 404) {
          res.status(401).json({ message: 'User not found' });
          return;
        }
      }
      logger.error('Error validating token with auth service:', error);
      res.status(500).json({ message: 'Error validating authentication' });
      return;
    }
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 
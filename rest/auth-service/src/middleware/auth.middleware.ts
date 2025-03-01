import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import logger from '../utils/logger';
import prisma from "../utils/prisma";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Access token is required' });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.accessToken.secret) as {
      id: string;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'User not found or inactive' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      roles: user.roles.map(ur => ur.role.name),
    };

    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }
};

export const checkPermission = (requiredPermission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      const userPermissions = await prisma.permission.findMany({
        where: {
          roles: {
            some: {
              role: {
                users: {
                  some: {
                    userId: req.user.id,
                  },
                },
              },
            },
          },
        },
      });

      if (userPermissions.some(p => p.name === requiredPermission)) {
        next();
      } else {
        res.status(403).json({ message: 'Insufficient permissions' });
      }
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({ message: 'Error checking permissions' });
    }
  };
}; 
import {NextFunction, Response} from 'express';
import jwt from 'jsonwebtoken';
import {config} from '../utils/config';
import logger from '../utils/logger';
import prisma from "../utils/prisma";
import {AuthRequest} from "../types/authRequest";

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


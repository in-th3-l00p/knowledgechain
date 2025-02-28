import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

router.get(
  '/profile', 
  authenticateToken, 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      const userProfile = {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map(ur => ({
          name: ur.role.name,
          permissions: ur.role.permissions.map(rp => rp.permission.name),
        })),
      };

      res.json(userProfile);
    } catch (error) {
      logger.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Error fetching profile' });
    }
  });

export default router;
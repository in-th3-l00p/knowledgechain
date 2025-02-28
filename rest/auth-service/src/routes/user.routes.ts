import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkPermission, AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get user profile
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

// Update user profile
router.put(
  '/profile', 
  authenticateToken, 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { firstName, lastName } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          firstName,
          lastName,
        },
      });

      logger.info(`Profile updated for user: ${updatedUser.email}`);
      res.json({
        message: 'Profile updated successfully',
        user: {
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
        },
      });
    } catch (error) {
      logger.error('Error updating profile:', error);
      res.status(500).json({ message: 'Error updating profile' });
    }
  });

// Admin routes
router.get(
  '/users', 
  authenticateToken, 
  checkPermission('VIEW_USERS'), 
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const users = await prisma.user.findMany({
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      res.json(users);
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({ message: 'Error fetching users' });
    }
  });

export default router; 
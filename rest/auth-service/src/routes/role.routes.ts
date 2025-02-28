import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, checkPermission } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Get all roles
router.get('/', 
  authenticateToken, 
  checkPermission('VIEW_ROLES'), 
  async (req, res) => {
    try {
      const roles = await prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      res.json(roles);
    } catch (error) {
      logger.error('Error fetching roles:', error);
      res.status(500).json({ message: 'Error fetching roles' });
    }
});

// Create new role
router.post('/',
  authenticateToken,
  checkPermission('MANAGE_ROLES'),
  async (req, res) => {
    try {
      const { name, description, permissionIds } = req.body;

      const role = await prisma.role.create({
        data: {
          name,
          description,
          permissions: {
            create: permissionIds.map((permissionId: string) => ({
              permission: {
                connect: { id: permissionId },
              },
            })),
          },
        },
      });

      logger.info(`New role created: ${role.name}`);
      res.status(201).json(role);
    } catch (error) {
      logger.error('Error creating role:', error);
      res.status(500).json({ message: 'Error creating role' });
    }
});

export default router; 
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import logger from '../config/logger';
import {checkPermission} from "../utils/checkPermission";

const router = Router();

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

router.get('/:id',
  authenticateToken,
  checkPermission('VIEW_ROLES'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (!role) {
        res.status(404).json({ message: 'Role not found' }).end();
        return;
      }

      res.json(role);
    } catch (error) {
      logger.error(`Error fetching role with id ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error fetching role' }).end();
    }
});

router.put('/:id',
  authenticateToken,
  checkPermission('MANAGE_ROLES'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, permissionIds } = req.body;

      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }

      // Update role with new permissions
      const updatedRole = await prisma.role.update({
        where: { id },
        data: {
          name,
          description,
          permissions: {
            // Delete existing permissions
            deleteMany: {},
            // Create new permissions
            create: permissionIds.map((permissionId: string) => ({
              permission: {
                connect: { id: permissionId },
              },
            })),
          },
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      logger.info(`Role updated: ${updatedRole.name}`);
      res.json(updatedRole);
    } catch (error) {
      logger.error(`Error updating role with id ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error updating role' });
    }
});

router.delete('/:id',
  authenticateToken,
  checkPermission('MANAGE_ROLES'),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        res.status(404).json({ message: 'Role not found' });
        return;
      }

      // Delete role
      await prisma.role.delete({
        where: { id },
      });

      logger.info(`Role deleted: ${existingRole.name}`);
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      logger.error(`Error deleting role with id ${req.params.id}:`, error);
      res.status(500).json({ message: 'Error deleting role' });
    }
});

export default router; 
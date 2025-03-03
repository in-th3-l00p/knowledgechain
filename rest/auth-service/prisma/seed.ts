import { PrismaClient } from '@prisma/client';
import logger from '../src/utils/logger';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const permissions = [
  {
    name: 'VIEW_ROLES',
    description: 'Can view roles and their permissions',
  },
  {
    name: 'MANAGE_ROLES',
    description: 'Can create, update, and delete roles',
  },
  {
    name: 'VIEW_PROFILE',
    description: 'Can view user profile',
  },
  {
    name: 'MANAGE_PROFILE',
    description: 'Can manage user profiles',
  },
];

const roles = [
  {
    name: 'ADMIN',
    description: 'Administrator with full access',
    permissions: ['VIEW_ROLES', 'MANAGE_ROLES', 'VIEW_PROFILE', 'MANAGE_PROFILE'],
  },
  {
    name: 'USER',
    description: 'Regular user with basic access',
    permissions: ['VIEW_PROFILE'],
  },
];

const users = [
  {
    email: 'admin@example.com',
    username: 'admin',
    password: bcrypt.hashSync('password', 10),
    firstName: 'Admin',
    lastName: 'User',
    roles: ['ADMIN'],
  },
  {
    email: 'user@example.com',
    username: 'user',
    password: bcrypt.hashSync('password', 10),
    firstName: 'Regular',
    lastName: 'User',
    roles: ['USER'],
  },
];

async function main() {
  try {
    logger.info('Starting database seed...');

    logger.info('Creating permissions...');
    const createdPermissions = await Promise.all(
      permissions.map(async (permission) => {
        return await prisma.permission.upsert({
          where: { name: permission.name },
          update: {},
          create: {
            name: permission.name,
            description: permission.description,
          },
        });
      })
    );

    logger.info(`Created ${createdPermissions.length} permissions`);

    logger.info('Creating roles...');
    for (const role of roles) {
      const createdRole = await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: {
          name: role.name,
          description: role.description,
        },
      });

      const rolePermissions = await prisma.permission.findMany({
        where: {
          name: {
            in: role.permissions,
          },
        },
      });

      await Promise.all(
        rolePermissions.map(async (permission) => {
          return await prisma.rolePermission.upsert({
            where: {
              roleId_permissionId: {
                roleId: createdRole.id,
                permissionId: permission.id,
              },
            },
            update: {},
            create: {
              roleId: createdRole.id,
              permissionId: permission.id,
            },
          });
        })
      );

      logger.info(`Created role ${role.name} with ${rolePermissions.length} permissions`);
    }

    logger.info('Creating users...');
    for (const user of users) {
      const createdUser = await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          email: user.email,
          username: user.username,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: true,
        },
      });

      const userRoles = await prisma.role.findMany({
        where: {
          name: {
            in: user.roles,
          },
        },
      });

      await Promise.all(
        userRoles.map(async (role) => {
          return await prisma.userRole.upsert({
            where: {
              userId_roleId: {
                userId: createdUser.id,
                roleId: role.id,
              },
            },
            update: {},
            create: {
              userId: createdUser.id,
              roleId: role.id,
            },
          });
        })
      );

      logger.info(`Created user ${user.email} with ${userRoles.length} roles`);
    }

    logger.info('Seed completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    logger.error('Seed failed:', error);
    process.exit(1);
  });

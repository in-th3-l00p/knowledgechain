import { PrismaClient } from '@prisma/client';
import logger from '../src/utils/logger';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const users = [
  {
    email: 'admin@example.com',
    username: 'admin',
    password: bcrypt.hashSync('password', 10),
    firstName: 'Admin',
    lastName: 'User',
  },
  {
    email: 'user@example.com',
    username: 'user',
    password: bcrypt.hashSync('password', 10),
    firstName: 'Regular',
    lastName: 'User',
  },
];

async function main() {
  try {
    logger.info('Starting database seed...');

    logger.info('Creating users...');
    for (const user of users) {
      await prisma.user.upsert({
        where: {email: user.email},
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

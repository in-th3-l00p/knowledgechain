import prisma from '../utils/prisma';
import { User, Prisma } from '@prisma/client';
import { getProducer } from '../utils/kafka';
import logger from '../utils/logger';
import bcrypt from 'bcrypt';

class UserService {
  private async publishUserEvent(topic: string, payload: any) {
    try {
      const producer = getProducer();
      await producer.send({
        topic,
        messages: [
          { 
            value: JSON.stringify({
              timestamp: new Date().toISOString(),
              ...payload
            })
          },
        ],
      });
    } catch (error) {
      logger.error('Failed to publish user event:', error);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const existingEmail = await this.getUserByEmail(data.email);
    if (existingEmail) {
      logger.info(`Email already in use: ${data.email}`);
      throw new Error('Email already in use');
    }

    const existingUsername = await this.getUserByUsername(data.username);
    if (existingUsername) {
      logger.info(`Username already taken: ${data.username}`);
      throw new Error('Username already taken');
    }

    if ('password' in data) {
      data.password = await this.hashPassword(data.password);
    }

    const user = await prisma.user.create({ data });
    logger.info(`Created new user with ID: ${user.id}, name: ${user.firstName} ${user.lastName}`);
    await this.publishUserEvent('user.created', { user });
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (user) {
      logger.info(`Fetched user with ID: ${id}`);
      await this.publishUserEvent('user.retrieved', { id, user });
    } else {
      logger.info(`User not found with ID: ${id}`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      logger.info(`Fetched user with email: ${email}`);
      await this.publishUserEvent('user.retrieved', { email, user });
    }
    return user;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { username },
    });
    if (user) {
      logger.info(`Fetched user with username: ${username}`);
      await this.publishUserEvent('user.retrieved', { username, user });
    }
    return user;
  }

  async getAllUsers(skip?: number, take?: number): Promise<User[]> {
    const users = await prisma.user.findMany({
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
    logger.info(`Fetched ${users.length} users with pagination: skip=${skip}, take=${take}`);
    await this.publishUserEvent('user.retrieved.all', { 
      count: users.length,
      skip,
      take
    });
    return users;
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      logger.info(`Update failed: User not found with ID: ${id}`);
      throw new Error('User not found');
    }

    if (data.email && data.email !== existingUser.email) {
      const existingEmail = await this.getUserByEmail(data.email as string);
      if (existingEmail) {
        logger.info(`Update failed: Email already in use: ${data.email}`);
        throw new Error('Email already in use');
      }
    }

    if (data.username && data.username !== existingUser.username) {
      const existingUsername = await this.getUserByUsername(data.username as string);
      if (existingUsername) {
        logger.info(`Update failed: Username already taken: ${data.username}`);
        throw new Error('Username already taken');
      }
    }

    if (data.password) {
      data.password = await this.hashPassword(data.password as string);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });
    logger.info(`Updated user with ID: ${id}, name: ${user.firstName} ${user.lastName}`);
    await this.publishUserEvent('user.updated', { id, updates: data, user });
    return user;
  }

  async deleteUser(id: string): Promise<User> {
    const existingUser = await this.getUserById(id);
    if (!existingUser) {
      logger.info(`Delete failed: User not found with ID: ${id}`);
      throw new Error('User not found');
    }

    const user = await prisma.user.delete({
      where: { id },
    });
    logger.info(`Deleted user with ID: ${id}`);
    await this.publishUserEvent('user.deleted', { id, user });
    return user;
  }

  async countUsers(): Promise<number> {
    const count = await prisma.user.count();
    logger.info(`Counted total users: ${count}`);
    await this.publishUserEvent('user.counted', { count });
    return count;
  }
}

const userService = new UserService();
export default userService; 
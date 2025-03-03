import { Consumer } from 'kafkajs';
import prisma from '../utils/prisma';
import { getConsumer } from '../utils/kafka';
import logger from '../utils/logger';

class UserSyncService {
  private consumer: Consumer | null = null;

  async initialize() {
    this.consumer = getConsumer();
    if (this.consumer === null)
        return;
    try {
      await this.consumer.subscribe({
        topics: ['user.created', 'user.updated', 'user.deleted']
      });

      await this.consumer.run({
        eachMessage: async ({ topic, message }) => {
          if (!message.value) return;
          
          const eventData = JSON.parse(message.value.toString());
          const { user, timestamp } = eventData;

          try {
            switch (topic) {
              case 'user.created':
                await this.handleUserCreated(user);
                break;
              case 'user.updated':
                await this.handleUserUpdated(eventData.id, eventData.updates);
                break;
              case 'user.deleted':
                await this.handleUserDeleted(eventData.id);
                break;
            }
            logger.info(`Processed ${topic} event from timestamp ${timestamp}`);
          } catch (error) {
            logger.error(`Error processing ${topic} event:`, error);
          }
        }
      });

      logger.info('User sync service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize user sync service:', error);
      throw error;
    }
  }

  private async handleUserCreated(userData: any) {
    await prisma.user.create({
      data: {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: userData.isActive,
        emailVerified: userData.emailVerified
      }
    });
  }

  private async handleUserUpdated(userId: string, updates: any) {
    await prisma.user.update({
      where: { id: userId },
      data: updates
    });
  }

  private async handleUserDeleted(userId: string) {
    await prisma.user.delete({
      where: { id: userId }
    });
  }
}

const userSyncService = new UserSyncService();
export default userSyncService; 
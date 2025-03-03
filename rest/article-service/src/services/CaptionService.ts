import prisma from '../utils/prisma';
import { Caption, Prisma } from '@prisma/client';
import { getProducer } from '../utils/kafka';
import logger from '../utils/logger';

class CaptionService {
  private async publishCaptionEvent(topic: string, payload: any) {
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
      logger.error('Failed to publish caption event:', error);
    }
  }

  async createCaption(data: Prisma.CaptionCreateInput): Promise<Caption> {
    // Check if language caption already exists for video
    const existingCaption = await prisma.caption.findFirst({
      where: {
        videoId: data.video.connect?.id,
        language: data.language
      }
    });

    if (existingCaption) {
      logger.info(`Caption for language ${data.language} already exists for video: ${data.video.connect?.id}`);
      throw new Error(`Caption for language ${data.language} already exists`);
    }

    const caption = await prisma.caption.create({
      data,
      include: {
        video: true,
      },
    });

    logger.info(`Created new caption for video: ${caption.videoId}, language: ${caption.language}`);
    await this.publishCaptionEvent('caption.created', { caption });
    return caption;
  }

  async getCaptionById(id: string): Promise<Caption | null> {
    const caption = await prisma.caption.findUnique({
      where: { id },
      include: {
        video: true,
      },
    });

    if (caption) {
      logger.info(`Fetched caption with ID: ${id}`);
      await this.publishCaptionEvent('caption.retrieved', { id, caption });
    }
    return caption;
  }

  async getCaptionsByVideoId(videoId: string): Promise<Caption[]> {
    const captions = await prisma.caption.findMany({
      where: { videoId },
      include: {
        video: true,
      },
    });

    logger.info(`Fetched ${captions.length} captions for video: ${videoId}`);
    await this.publishCaptionEvent('caption.retrieved.all', { videoId, count: captions.length });
    return captions;
  }

  async updateCaption(id: string, data: Prisma.CaptionUpdateInput): Promise<Caption> {
    const existingCaption = await this.getCaptionById(id);
    if (!existingCaption) {
      logger.info(`Update failed: Caption not found with ID: ${id}`);
      throw new Error('Caption not found');
    }

    const caption = await prisma.caption.update({
      where: { id },
      data,
      include: {
        video: true,
      },
    });

    logger.info(`Updated caption with ID: ${id}`);
    await this.publishCaptionEvent('caption.updated', { id, updates: data, caption });
    return caption;
  }

  async deleteCaption(id: string): Promise<Caption> {
    const existingCaption = await this.getCaptionById(id);
    if (!existingCaption) {
      logger.info(`Delete failed: Caption not found with ID: ${id}`);
      throw new Error('Caption not found');
    }

    const caption = await prisma.caption.delete({
      where: { id },
      include: {
        video: true,
      },
    });

    logger.info(`Deleted caption with ID: ${id}`);
    await this.publishCaptionEvent('caption.deleted', { id, caption });
    return caption;
  }
}

const captionService = new CaptionService();
export default captionService; 
import prisma from '../utils/prisma';
import { Video, Prisma } from '@prisma/client';
import { getProducer } from '../utils/kafka';
import logger from '../utils/logger';

class VideoService {
  private async publishVideoEvent(topic: string, payload: any) {
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
      logger.error('Failed to publish video event:', error);
    }
  }

  async createVideo(data: Prisma.VideoCreateInput): Promise<Video> {
    // Check if article already has a video
    const existingVideo = await this.getVideoByArticleId(data.article.connect?.id as string);
    if (existingVideo) {
      logger.info(`Article already has a video: ${data.article.connect?.id}`);
      throw new Error('Article already has a video');
    }

    const video = await prisma.video.create({
      data,
      include: {
        captions: true,
        article: true,
      },
    });

    logger.info(`Created new video for article: ${video.articleId}`);
    await this.publishVideoEvent('video.created', { video });
    return video;
  }

  async getVideoById(id: string): Promise<Video | null> {
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        captions: true,
        article: true,
      },
    });

    if (video) {
      logger.info(`Fetched video with ID: ${id}`);
      await this.publishVideoEvent('video.retrieved', { id, video });
    } else {
      logger.info(`Video not found with ID: ${id}`);
    }
    return video;
  }

  async getVideoByArticleId(articleId: string): Promise<Video | null> {
    const video = await prisma.video.findUnique({
      where: { articleId },
      include: {
        captions: true,
        article: true,
      },
    });

    if (video) {
      logger.info(`Fetched video for article: ${articleId}`);
      await this.publishVideoEvent('video.retrieved', { articleId, video });
    }
    return video;
  }

  async updateVideo(id: string, data: Prisma.VideoUpdateInput): Promise<Video> {
    const existingVideo = await this.getVideoById(id);
    if (!existingVideo) {
      logger.info(`Update failed: Video not found with ID: ${id}`);
      throw new Error('Video not found');
    }

    const video = await prisma.video.update({
      where: { id },
      data,
      include: {
        captions: true,
        article: true,
      },
    });

    logger.info(`Updated video with ID: ${id}`);
    await this.publishVideoEvent('video.updated', { id, updates: data, video });
    return video;
  }

  async deleteVideo(id: string): Promise<Video> {
    const existingVideo = await this.getVideoById(id);
    if (!existingVideo) {
      logger.info(`Delete failed: Video not found with ID: ${id}`);
      throw new Error('Video not found');
    }

    const video = await prisma.video.delete({
      where: { id },
      include: {
        captions: true,
        article: true,
      },
    });

    logger.info(`Deleted video with ID: ${id}`);
    await this.publishVideoEvent('video.deleted', { id, video });
    return video;
  }

  async addCaption(videoId: string, data: Prisma.CaptionCreateInput): Promise<Video> {
    const video = await prisma.video.update({
      where: { id: videoId },
      data: {
        captions: {
          create: data,
        },
      },
      include: {
        captions: true,
        article: true,
      },
    });

    logger.info(`Added caption to video: ${videoId}`);
    await this.publishVideoEvent('video.caption.added', { videoId, caption: data });
    return video;
  }

  async removeCaption(videoId: string, captionId: string): Promise<Video> {
    const video = await prisma.video.update({
      where: { id: videoId },
      data: {
        captions: {
          delete: { id: captionId },
        },
      },
      include: {
        captions: true,
        article: true,
      },
    });

    logger.info(`Removed caption from video: ${videoId}`);
    await this.publishVideoEvent('video.caption.removed', { videoId, captionId });
    return video;
  }
}

const videoService = new VideoService();
export default videoService; 
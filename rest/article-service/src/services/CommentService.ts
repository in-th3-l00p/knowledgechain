import prisma from '../utils/prisma';
import { Comment, Prisma } from '@prisma/client';
import { getProducer } from '../utils/kafka';
import logger from '../utils/logger';

class CommentService {
  private async publishCommentEvent(topic: string, payload: any) {
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
      logger.error('Failed to publish comment event:', error);
    }
  }

  async createComment(data: Prisma.CommentCreateInput): Promise<Comment> {
    const comment = await prisma.comment.create({
      data,
      include: {
        article: true,
        parent: true,
        replies: true
      }
    });

    logger.info(`Created new comment for article: ${comment.articleId}`);
    await this.publishCommentEvent('comment.created', { comment });
    return comment;
  }

  async getCommentById(id: string): Promise<Comment | null> {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        article: true,
        parent: true,
        replies: true
      }
    });

    if (comment) {
      logger.info(`Fetched comment with ID: ${id}`);
      await this.publishCommentEvent('comment.retrieved', { id, comment });
    }
    return comment;
  }

  async getArticleComments(
    articleId: string,
    skip?: number,
    take?: number
  ): Promise<Comment[]> {
    const comments = await prisma.comment.findMany({
      where: { 
        articleId,
        parentId: null
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          include: {
            replies: true
          }
        }
      }
    });

    logger.info(`Fetched ${comments.length} comments for article: ${articleId}`);
    await this.publishCommentEvent('comment.retrieved.article', { articleId, count: comments.length });
    return comments;
  }

  async getCommentReplies(
    parentId: string,
    skip?: number,
    take?: number
  ): Promise<Comment[]> {
    const replies = await prisma.comment.findMany({
      where: { parentId },
      skip,
      take,
      orderBy: { createdAt: 'asc' },
      include: {
        replies: true
      }
    });

    logger.info(`Fetched ${replies.length} replies for comment: ${parentId}`);
    await this.publishCommentEvent('comment.retrieved.replies', { parentId, count: replies.length });
    return replies;
  }

  async updateComment(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
    const existingComment = await this.getCommentById(id);
    if (!existingComment) {
      logger.info(`Update failed: Comment not found with ID: ${id}`);
      throw new Error('Comment not found');
    }

    const comment = await prisma.comment.update({
      where: { id },
      data,
      include: {
        article: true,
        parent: true,
        replies: true
      }
    });

    logger.info(`Updated comment with ID: ${id}`);
    await this.publishCommentEvent('comment.updated', { id, updates: data, comment });
    return comment;
  }

  async deleteComment(id: string): Promise<Comment> {
    const existingComment = await this.getCommentById(id);
    if (!existingComment) {
      logger.info(`Delete failed: Comment not found with ID: ${id}`);
      throw new Error('Comment not found');
    }

    const comment = await prisma.comment.delete({
      where: { id },
      include: {
        article: true,
        parent: true,
        replies: true
      }
    });

    logger.info(`Deleted comment with ID: ${id}`);
    await this.publishCommentEvent('comment.deleted', { id, comment });
    return comment;
  }

  async countArticleComments(articleId: string): Promise<number> {
    const count = await prisma.comment.count({
      where: { articleId }
    });
    logger.info(`Counted ${count} comments for article: ${articleId}`);
    await this.publishCommentEvent('comment.counted', { articleId, count });
    return count;
  }
}

const commentService = new CommentService();
export default commentService; 
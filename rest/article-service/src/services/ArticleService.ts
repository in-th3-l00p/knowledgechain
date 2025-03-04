import prisma from '../utils/prisma';
import { Article, Prisma, ArticleStatus } from '@prisma/client';
import { getProducer } from '../utils/kafka';
import logger from '../utils/logger';
import slugify from 'slugify';

class ArticleService {
  private async publishArticleEvent(topic: string, payload: any) {
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
      logger.error('Failed to publish article event:', error);
    }
  }

  private generateSlug(title: string): string {
    return slugify(title, {
      lower: true,
      strict: true,
      trim: true
    });
  }

  async createArticle(data: Prisma.ArticleCreateInput): Promise<Article> {
    // Generate slug from title
    const baseSlug = this.generateSlug(data.title);
    let slug = baseSlug;
    let counter = 1;

    // Check for slug uniqueness and modify if necessary
    while (await this.getArticleBySlug(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const article = await prisma.article.create({
      data: {
        ...data,
        slug,
      },
    });

    logger.info(`Created new article with ID: ${article.id}, title: ${article.title}`);
    await this.publishArticleEvent('article.created', { article });
    return article;
  }

  async getArticleById(id: string): Promise<Article | null> {
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        video: {
          include: {
            captions: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (article) {
      logger.info(`Fetched article with ID: ${id}`);
      await this.publishArticleEvent('article.retrieved', { id, article });
    } else {
      logger.info(`Article not found with ID: ${id}`);
    }
    return article;
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        video: {
          include: {
            captions: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (article) {
      logger.info(`Fetched article with slug: ${slug}`);
      await this.publishArticleEvent('article.retrieved', { slug, article });
    }
    return article;
  }

  async getAllArticles(
    skip?: number, 
    take?: number,
    where?: Prisma.ArticleWhereInput,
    orderBy?: Prisma.ArticleOrderByWithRelationInput
  ): Promise<Article[]> {
    const articles = await prisma.article.findMany({
      skip,
      take,
      where,
      orderBy: orderBy || { createdAt: 'desc' },
      include: {
        video: true,
        tags: {
          include: {
            tag: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    logger.info(`Fetched ${articles.length} articles`);
    await this.publishArticleEvent('article.retrieved.all', { 
      count: articles.length,
      skip,
      take,
      filters: where
    });
    return articles;
  }

  async updateArticle(id: string, data: Prisma.ArticleUpdateInput): Promise<Article> {
    const existingArticle = await this.getArticleById(id);
    if (!existingArticle) {
      logger.info(`Update failed: Article not found with ID: ${id}`);
      throw new Error('Article not found');
    }

    // If title is being updated, generate new slug
    if (data.title) {
      const newSlug = this.generateSlug(data.title as string);
      if (newSlug !== existingArticle.slug) {
        data.slug = newSlug;
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data,
      include: {
        video: true,
        tags: true,
        categories: true,
      },
    });

    logger.info(`Updated article with ID: ${id}, title: ${article.title}`);
    await this.publishArticleEvent('article.updated', { id, updates: data, article });
    return article;
  }

  async updateArticleStatus(id: string, status: ArticleStatus): Promise<Article> {
    const article = await prisma.article.update({
      where: { id },
      data: {
        status,
        publishedAt: status === ArticleStatus.PUBLISHED ? new Date() : undefined,
        published: status === ArticleStatus.PUBLISHED,
      },
    });

    logger.info(`Updated article status with ID: ${id} to ${status}`);
    await this.publishArticleEvent('article.status.updated', { id, status, article });
    return article;
  }

  async incrementViews(id: string): Promise<Article> {
    const article = await prisma.article.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    logger.info(`Incremented views for article ID: ${id}`);
    await this.publishArticleEvent('article.viewed', { id, views: article.views });
    return article;
  }

  async deleteArticle(id: string): Promise<Article> {
    const existingArticle = await this.getArticleById(id);
    if (!existingArticle) {
      logger.info(`Delete failed: Article not found with ID: ${id}`);
      throw new Error('Article not found');
    }

    const article = await prisma.article.delete({
      where: { id },
      include: {
        video: true,
        tags: true,
        categories: true,
      },
    });

    logger.info(`Deleted article with ID: ${id}`);
    await this.publishArticleEvent('article.deleted', { id, article });
    return article;
  }

  async getArticlesByAuthor(authorId: string, skip?: number, take?: number): Promise<Article[]> {
    const articles = await this.getAllArticles(skip, take, { authorId });
    logger.info(`Fetched ${articles.length} articles for author: ${authorId}`);
    return articles;
  }

  async countArticles(where?: Prisma.ArticleWhereInput): Promise<number> {
    const count = await prisma.article.count({ where });
    logger.info(`Counted total articles: ${count}`);
    await this.publishArticleEvent('article.counted', { count, filters: where });
    return count;
  }
}

const articleService = new ArticleService();
export default articleService; 
import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/authRequest';
import articleService from '../services/ArticleService';
import logger from '../utils/logger';
import { ArticleStatus, Prisma } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const articleData = {
        ...req.body,
        authorId: req.user!.id,
      };

      const article = await articleService.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      logger.error('Error creating article:', error);
      res.status(500).json({ message: 'Error creating article' });
    }
  }
);

router.get(
  '/',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { 
        skip, 
        take, 
        status, 
        authorId, 
        categoryId,
        tagId,
        orderBy 
      } = req.query;

      const where: Prisma.ArticleWhereInput = {
        ...(status && { status: status as ArticleStatus }),
        ...(authorId && { authorId: authorId as string }),
        ...(categoryId && {
          categories: {
            some: { categoryId: categoryId as string }
          }
        }),
        ...(tagId && {
          tags: {
            some: { tagId: tagId as string }
          }
        }),
        ...(!status && { status: ArticleStatus.PUBLISHED })
      };

      const articles = await articleService.getAllArticles(
        skip ? parseInt(skip as string) : undefined,
        take ? parseInt(take as string) : undefined,
        where,
        orderBy as Prisma.ArticleOrderByWithRelationInput
      );

      const total = await articleService.countArticles(where);

      res.json({
        data: articles,
        total,
        skip: skip ? parseInt(skip as string) : 0,
        take: take ? parseInt(take as string) : total,
      });
    } catch (error) {
      logger.error('Error fetching articles:', error);
      res.status(500).json({ message: 'Error fetching articles' });
    }
  }
);

router.get(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const article = await articleService.getArticleById(req.params.id);
      
      if (!article) {
        res.status(404).json({ message: 'Article not found' });
        return;
      }

      await articleService.incrementViews(req.params.id);
      
      res.json(article);
    } catch (error) {
      logger.error('Error fetching article:', error);
      res.status(500).json({ message: 'Error fetching article' });
    }
  }
);

router.get(
  '/by-slug/:slug',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const article = await articleService.getArticleBySlug(req.params.slug);
      
      if (!article) {
        res.status(404).json({ message: 'Article not found' });
        return;
      }

      await articleService.incrementViews(article.id);
      
      res.json(article);
    } catch (error) {
      logger.error('Error fetching article by slug:', error);
      res.status(500).json({ message: 'Error fetching article' });
    }
  }
);

router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const article = await articleService.getArticleById(req.params.id);
      
      if (!article) {
        res.status(404).json({ message: 'Article not found' });
        return;
      }

      if (article.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to update this article' });
        return;
      }

      const updatedArticle = await articleService.updateArticle(req.params.id, req.body);
      res.json(updatedArticle);
    } catch (error) {
      logger.error('Error updating article:', error);
      res.status(500).json({ message: 'Error updating article' });
    }
  }
);

router.patch(
  '/:id/status',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.body;
      
      if (!Object.values(ArticleStatus).includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }

      const article = await articleService.getArticleById(req.params.id);
      
      if (!article) {
        res.status(404).json({ message: 'Article not found' });
        return;
      }

      if (article.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to update this article' });
        return;
      }

      const updatedArticle = await articleService.updateArticleStatus(req.params.id, status);
      res.json(updatedArticle);
    } catch (error) {
      logger.error('Error updating article status:', error);
      res.status(500).json({ message: 'Error updating article status' });
    }
  }
);

router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const article = await articleService.getArticleById(req.params.id);
      
      if (!article) {
        res.status(404).json({ message: 'Article not found' });
        return;
      }

      if (article.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to delete this article' });
        return;
      }

      await articleService.deleteArticle(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting article:', error);
      res.status(500).json({ message: 'Error deleting article' });
    }
  }
);

router.get(
  '/author/:authorId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { skip, take } = req.query;
      
      const articles = await articleService.getArticlesByAuthor(
        req.params.authorId,
        skip ? parseInt(skip as string) : undefined,
        take ? parseInt(take as string) : undefined
      );

      res.json(articles);
    } catch (error) {
      logger.error('Error fetching author articles:', error);
      res.status(500).json({ message: 'Error fetching author articles' });
    }
  }
);

export default router; 
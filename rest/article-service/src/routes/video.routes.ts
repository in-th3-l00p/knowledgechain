import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/authRequest';
import videoService from '../services/VideoService';
import articleService from '../services/ArticleService';
import logger from '../utils/logger';

const router = Router();

// Create video for an article
router.post(
  '/article/:articleId',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const article = await articleService.getArticleById(req.params.articleId);
      
      if (!article) {
        res.status(404).json({ message: 'Article not found' });
        return;
      }

      // Check if user is the article author
      if (article.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to add video to this article' });
        return;
      }

      const videoData = {
        ...req.body,
        article: {
          connect: { id: req.params.articleId }
        }
      };

      const video = await videoService.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      logger.error('Error creating video:', error);
      res.status(500).json({ message: 'Error creating video' });
    }
  }
);

// Get video by ID
router.get(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const video = await videoService.getVideoById(req.params.id);
      
      if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
      }
      
      const article = await articleService.getArticleById(video.articleId);
      if (article?.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }
      
      res.json(video);
    } catch (error) {
      logger.error('Error fetching video:', error);
      res.status(500).json({ message: 'Error fetching video' });
    }
  }
);

// Get video by article ID
router.get(
  '/article/:articleId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const video = await videoService.getVideoByArticleId(req.params.articleId);
      
      if (!video) {
        res.status(404).json({ message: 'Video not found for this article' });
        return;
      }
      
      const article = await articleService.getArticleById(video.articleId);
      if (article?.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized' });
        return;
      }
      
      res.json(video);
    } catch (error) {
      logger.error('Error fetching video:', error);
      res.status(500).json({ message: 'Error fetching video' });
    }
  }
);

// Update video
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const video = await videoService.getVideoById(req.params.id);
      
      if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
      }

      const article = await articleService.getArticleById(video.articleId);
      if (article?.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to update this video' });
        return;
      }

      const updatedVideo = await videoService.updateVideo(req.params.id, req.body);
      res.json(updatedVideo);
    } catch (error) {
      logger.error('Error updating video:', error);
      res.status(500).json({ message: 'Error updating video' });
    }
  }
);

// Delete video
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const video = await videoService.getVideoById(req.params.id);
      
      if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
      }

      const article = await articleService.getArticleById(video.articleId);
      if (article?.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to delete this video' });
        return;
      }

      await videoService.deleteVideo(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting video:', error);
      res.status(500).json({ message: 'Error deleting video' });
    }
  }
);

// Add caption to video
router.post(
  '/:id/captions',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const video = await videoService.getVideoById(req.params.id);
      
      if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
      }

      const article = await articleService.getArticleById(video.articleId);
      if (article?.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to add captions to this video' });
        return;
      }

      const updatedVideo = await videoService.addCaption(req.params.id, req.body);
      res.status(201).json(updatedVideo);
    } catch (error) {
      logger.error('Error adding caption:', error);
      res.status(500).json({ message: 'Error adding caption' });
    }
  }
);

// Remove caption from video
router.delete(
  '/:id/captions/:captionId',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const video = await videoService.getVideoById(req.params.id);
      
      if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
      }

      const article = await articleService.getArticleById(video.articleId);
      if (article?.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to remove captions from this video' });
        return;
      }

      const updatedVideo = await videoService.removeCaption(req.params.id, req.params.captionId);
      res.status(200).json(updatedVideo);
    } catch (error) {
      logger.error('Error removing caption:', error);
      res.status(500).json({ message: 'Error removing caption' });
    }
  }
);

export default router; 
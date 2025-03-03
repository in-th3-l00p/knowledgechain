import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/authRequest';
import captionService from '../services/CaptionService';
import videoService from '../services/VideoService';
import articleService from '../services/ArticleService';
import logger from '../utils/logger';

const router = Router();

// Create caption for a video
router.post(
  '/video/:videoId',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const video = await videoService.getVideoById(req.params.videoId);
      
      if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
      }

      const article = await articleService.getArticleById(video.articleId);
      if (article?.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to add captions to this video' });
        return;
      }

      const captionData = {
        ...req.body,
        video: {
          connect: { id: req.params.videoId }
        }
      };

      const caption = await captionService.createCaption(captionData);
      res.status(201).json(caption);
    } catch (error) {
      logger.error('Error creating caption:', error);
      res.status(500).json({ message: 'Error creating caption' });
    }
  }
);

// Get caption by ID
router.get(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const caption = await captionService.getCaptionById(req.params.id);
      
      if (!caption) {
        res.status(404).json({ message: 'Caption not found' });
        return;
      }

      const video = await videoService.getVideoById(caption.videoId);
      const article = await articleService.getArticleById(video!.articleId);
      
      res.json(caption);
    } catch (error) {
      logger.error('Error fetching caption:', error);
      res.status(500).json({ message: 'Error fetching caption' });
    }
  }
);

// Get all captions for a video
router.get(
  '/video/:videoId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const video = await videoService.getVideoById(req.params.videoId);
      
      if (!video) {
        res.status(404).json({ message: 'Video not found' });
        return;
      }

      const captions = await captionService.getCaptionsByVideoId(req.params.videoId);
      res.json(captions);
    } catch (error) {
      logger.error('Error fetching video captions:', error);
      res.status(500).json({ message: 'Error fetching video captions' });
    }
  }
);

// Update caption
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const caption = await captionService.getCaptionById(req.params.id);
      
      if (!caption) {
        res.status(404).json({ message: 'Caption not found' });
        return;
      }

      const video = await videoService.getVideoById(caption.videoId);
      const article = await articleService.getArticleById(video!.articleId);
      if (article?.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to update this caption' });
        return;
      }

      const updatedCaption = await captionService.updateCaption(req.params.id, req.body);
      res.json(updatedCaption);
    } catch (error) {
      logger.error('Error updating caption:', error);
      res.status(500).json({ message: 'Error updating caption' });
    }
  }
);

// Delete caption
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const caption = await captionService.getCaptionById(req.params.id);
      
      if (!caption) {
        res.status(404).json({ message: 'Caption not found' });
        return;
      }

      const video = await videoService.getVideoById(caption.videoId);
      const article = await articleService.getArticleById(video!.articleId);
      if (article?.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to delete this caption' });
        return;
      }

      await captionService.deleteCaption(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting caption:', error);
      res.status(500).json({ message: 'Error deleting caption' });
    }
  }
);

export default router; 
import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/authRequest';
import commentService from '../services/CommentService';
import articleService from '../services/ArticleService';
import logger from '../utils/logger';

const router = Router();

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

      const commentData = {
        ...req.body,
        authorId: req.user!.id,
        article: {
          connect: { id: req.params.articleId }
        }
      };

      const comment = await commentService.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      logger.error('Error creating comment:', error);
      res.status(500).json({ message: 'Error creating comment' });
    }
  }
);

router.post(
  '/:parentId/reply',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const parentComment = await commentService.getCommentById(req.params.parentId);
      
      if (!parentComment) {
        res.status(404).json({ message: 'Parent comment not found' });
        return;
      }

      const replyData = {
        ...req.body,
        authorId: req.user!.id,
        article: {
          connect: { id: parentComment.articleId }
        },
        parent: {
          connect: { id: req.params.parentId }
        }
      };

      const reply = await commentService.createComment(replyData);
      res.status(201).json(reply);
    } catch (error) {
      logger.error('Error creating reply:', error);
      res.status(500).json({ message: 'Error creating reply' });
    }
  }
);

router.get(
  '/article/:articleId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { skip, take } = req.query;
      
      const comments = await commentService.getArticleComments(
        req.params.articleId,
        skip ? parseInt(skip as string) : undefined,
        take ? parseInt(take as string) : undefined
      );

      const total = await commentService.countArticleComments(req.params.articleId);

      res.json({
        data: comments,
        total,
        skip: skip ? parseInt(skip as string) : 0,
        take: take ? parseInt(take as string) : total,
      });
    } catch (error) {
      logger.error('Error fetching article comments:', error);
      res.status(500).json({ message: 'Error fetching article comments' });
    }
  }
);

router.get(
  '/:id/replies',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { skip, take } = req.query;
      
      const replies = await commentService.getCommentReplies(
        req.params.id,
        skip ? parseInt(skip as string) : undefined,
        take ? parseInt(take as string) : undefined
      );

      res.json(replies);
    } catch (error) {
      logger.error('Error fetching comment replies:', error);
      res.status(500).json({ message: 'Error fetching comment replies' });
    }
  }
);

router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const comment = await commentService.getCommentById(req.params.id);
      
      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      if (comment.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to update this comment' });
        return;
      }

      const updatedComment = await commentService.updateComment(req.params.id, req.body);
      res.json(updatedComment);
    } catch (error) {
      logger.error('Error updating comment:', error);
      res.status(500).json({ message: 'Error updating comment' });
    }
  }
);

router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const comment = await commentService.getCommentById(req.params.id);
      
      if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
      }

      if (comment.authorId !== req.user!.id) {
        res.status(403).json({ message: 'Not authorized to delete this comment' });
        return;
      }

      await commentService.deleteComment(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting comment:', error);
      res.status(500).json({ message: 'Error deleting comment' });
    }
  }
);

export default router; 
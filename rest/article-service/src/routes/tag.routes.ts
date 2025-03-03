import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/authRequest';
import tagService from '../services/TagService';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

const router = Router();

// Create new tag
router.post(
  '/',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tag = await tagService.createTag(req.body);
      res.status(201).json(tag);
    } catch (error) {
      logger.error('Error creating tag:', error);
      res.status(500).json({ message: 'Error creating tag' });
    }
  }
);

// Get all tags with pagination
router.get(
  '/',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { skip, take, orderBy } = req.query;
      
      const tags = await tagService.getAllTags(
        skip ? parseInt(skip as string) : undefined,
        take ? parseInt(take as string) : undefined,
        orderBy as Prisma.TagOrderByWithRelationInput
      );

      const total = await tagService.countTags();

      res.json({
        data: tags,
        total,
        skip: skip ? parseInt(skip as string) : 0,
        take: take ? parseInt(take as string) : total,
      });
    } catch (error) {
      logger.error('Error fetching tags:', error);
      res.status(500).json({ message: 'Error fetching tags' });
    }
  }
);

// Get tag by ID
router.get(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tag = await tagService.getTagById(req.params.id);
      
      if (!tag) {
        res.status(404).json({ message: 'Tag not found' });
        return;
      }
      
      res.json(tag);
    } catch (error) {
      logger.error('Error fetching tag:', error);
      res.status(500).json({ message: 'Error fetching tag' });
    }
  }
);

// Get tag by slug
router.get(
  '/by-slug/:slug',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const tag = await tagService.getTagBySlug(req.params.slug);
      
      if (!tag) {
        res.status(404).json({ message: 'Tag not found' });
        return;
      }
      
      res.json(tag);
    } catch (error) {
      logger.error('Error fetching tag by slug:', error);
      res.status(500).json({ message: 'Error fetching tag' });
    }
  }
);

// Update tag
router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const updatedTag = await tagService.updateTag(req.params.id, req.body);
      res.json(updatedTag);
    } catch (error) {
      logger.error('Error updating tag:', error);
      res.status(500).json({ message: 'Error updating tag' });
    }
  }
);

// Delete tag
router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await tagService.deleteTag(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting tag:', error);
      res.status(500).json({ message: 'Error deleting tag' });
    }
  }
);

export default router; 
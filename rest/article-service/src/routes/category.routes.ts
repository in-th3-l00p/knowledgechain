import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/authRequest';
import categoryService from '../services/CategoryService';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

const router = Router();

router.post(
  '/',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      logger.error('Error creating category:', error);
      res.status(500).json({ message: 'Error creating category' });
    }
  }
);

router.get(
  '/',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { skip, take, orderBy } = req.query;
      
      const categories = await categoryService.getAllCategories(
        skip ? parseInt(skip as string) : undefined,
        take ? parseInt(take as string) : undefined,
        orderBy as Prisma.CategoryOrderByWithRelationInput
      );

      const total = await categoryService.countCategories();

      res.json({
        data: categories,
        total,
        skip: skip ? parseInt(skip as string) : 0,
        take: take ? parseInt(take as string) : total,
      });
    } catch (error) {
      logger.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Error fetching categories' });
    }
  }
);

router.get(
  '/root',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const categories = await categoryService.getRootCategories();
      res.json(categories);
    } catch (error) {
      logger.error('Error fetching root categories:', error);
      res.status(500).json({ message: 'Error fetching root categories' });
    }
  }
);

router.get(
  '/children/:parentId',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const categories = await categoryService.getChildCategories(req.params.parentId);
      res.json(categories);
    } catch (error) {
      logger.error('Error fetching child categories:', error);
      res.status(500).json({ message: 'Error fetching child categories' });
    }
  }
);

router.get(
  '/:id',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      
      res.json(category);
    } catch (error) {
      logger.error('Error fetching category:', error);
      res.status(500).json({ message: 'Error fetching category' });
    }
  }
);

router.get(
  '/by-slug/:slug',
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      
      res.json(category);
    } catch (error) {
      logger.error('Error fetching category by slug:', error);
      res.status(500).json({ message: 'Error fetching category by slug' });
    }
  }
);

router.put(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const updatedCategory = await categoryService.updateCategory(req.params.id, req.body);
      res.json(updatedCategory);
    } catch (error) {
      logger.error('Error updating category:', error);
      res.status(500).json({ message: 'Error updating category' });
    }
  }
);

router.delete(
  '/:id',
  authenticateToken,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting category:', error);
      res.status(500).json({ message: 'Error deleting category' });
    }
  }
);

export default router; 
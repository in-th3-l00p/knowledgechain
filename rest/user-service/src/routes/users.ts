import express from 'express';
import userService from '../services/UserService';
import {Prisma} from '@prisma/client';
import logger from '../utils/logger';
import {body, param, query} from 'express-validator';
import {validate} from "../middleware/validate";

const router = express.Router();

router.get('/',
  [
    query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a positive integer'),
    query('take').optional().isInt({ min: 1 }).withMessage('Take must be a positive integer')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const skip = req.query.skip ? parseInt(req.query.skip as string) : undefined;
      const take = req.query.take ? parseInt(req.query.take as string) : undefined;
      
      const [users, count] = await Promise.all([
        userService.getAllUsers(skip, take),
        userService.countUsers()
      ]);
      
      logger.info(`Fetched ${users.length} users with pagination: skip=${skip}, take=${take}`);
      res.json({
        data: users,
        meta: {
          total: count,
          skip,
          take
        }
      });
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

router.get('/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        logger.info(`User not found with ID: ${req.params.id}`);
        res.status(404).json({ error: 'User not found' });
        return;
      }
      logger.info(`Fetched user with ID: ${req.params.id}`);
      res.json(user);
    } catch (error) {
      logger.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
);

router.post('/',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('username').isString().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').isString().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
    body('lastName').isString().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const userData: Prisma.UserCreateInput = req.body;
      
      const existingEmail = await userService.getUserByEmail(userData.email);
      if (existingEmail) {
        logger.info(`Email already in use: ${userData.email}`);
        res.status(400).json({ error: 'Email already in use' });
        return;
      }
      
      const existingUsername = await userService.getUserByUsername(userData.username);
      if (existingUsername) {
        logger.info(`Username already taken: ${userData.username}`);
        res.status(400).json({ error: 'Username already taken' });
        return;
      }
      
      const newUser = await userService.createUser(userData);
      logger.info(`Created new user with ID: ${newUser.id}, name: ${userData.firstName || ''} ${userData.lastName || ''}`);
      res.status(201).json(newUser);
    } catch (error) {
      logger.error('Error creating user:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          logger.info('Email or username already exists');
          res.status(400).json({ error: 'Email or username already exists' });
          return;
        }
      }
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

router.put('/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('username').optional().isString().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('password').optional().isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').isString().isLength({ min: 1, max: 50 }).withMessage('First name must be between 1 and 50 characters'),
    body('lastName').isString().isLength({ min: 1, max: 50 }).withMessage('Last name must be between 1 and 50 characters'),
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const userData: Prisma.UserUpdateInput = req.body;
      
      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        logger.info(`User not found with ID: ${id}`);
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      if (userData.email && userData.email !== existingUser.email) {
        const existingEmail = await userService.getUserByEmail(userData.email as string);
        if (existingEmail) {
          logger.info(`Email already in use: ${userData.email}`);
          res.status(400).json({ error: 'Email already in use' });
          return;
        }
      }
      
      if (userData.username && userData.username !== existingUser.username) {
        const existingUsername = await userService.getUserByUsername(userData.username as string);
        if (existingUsername) {
          logger.info(`Username already taken: ${userData.username}`);
          res.status(400).json({ error: 'Username already taken' });
          return;
        }
      }
      
      const updatedUser = await userService.updateUser(id, userData);
      logger.info(`Updated user with ID: ${id}, name: ${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`);
      res.json(updatedUser);
    } catch (error) {
      logger.error('Error updating user:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          logger.info('Email or username already exists');
          res.status(400).json({ error: 'Email or username already exists' });
          return;
        }
      }
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

router.delete('/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      
      const existingUser = await userService.getUserById(id);
      if (!existingUser) {
        logger.info(`User not found with ID: ${id}`);
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      await userService.deleteUser(id);
      logger.info(`Deleted user with ID: ${id}`);
      res.status(204).send();
    } catch (error) {
      logger.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

export default router;
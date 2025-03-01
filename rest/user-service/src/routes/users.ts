import express from 'express';
import userService from '../services/UserService';
import {Prisma} from '@prisma/client';
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

      res.json({
        data: users,
        meta: {
          total: count,
          skip,
          take
        }
      });
    } catch (_) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

router.post('/',
    [
      body('email')
          .isEmail()
          .withMessage('Valid email is required'),
      body('username')
          .isString()
          .isLength({ min: 3, max: 30 })
          .withMessage('Username must be between 3 and 30 characters'),
      body('password')
          .isString()
          .isLength({ min: 6 })
          .withMessage('Password must be at least 6 characters'),
      body('firstName')
          .isString()
          .isLength({ min: 1, max: 50 })
          .withMessage('First name must be between 1 and 50 characters'),
      body('lastName')
          .isString()
          .isLength({ min: 1, max: 50 })
          .withMessage('Last name must be between 1 and 50 characters'),
    ],
    validate,
    async (req: express.Request, res: express.Response) => {
      try {
        const userData: Prisma.UserCreateInput = req.body;
        const newUser = await userService.createUser(userData);
        res.status(201).json(newUser);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Email already in use' || error.message === 'Username already taken') {
            res.status(400).json({ error: error.message });
            return;
          }
        }
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
);

router.get('/:id',
  [
    param('id')
        .isUUID()
        .withMessage('User ID must be a valid UUID')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json(user);
    } catch (_) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
);

router.put('/:id',
  [
    param('id')
        .isUUID()
        .withMessage('User ID must be a valid UUID'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Valid email is required'),
    body('username')
        .optional()
        .isString()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters'),
    body('password')
        .optional()
        .isString()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('firstName')
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
        .isString()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const userData: Prisma.UserUpdateInput = req.body;
      const updatedUser = await userService.updateUser(id, userData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === 'Email already in use' || error.message === 'Username already taken') {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

router.delete('/:id',
  param('id')
      .isUUID()
      .withMessage('User ID must be a valid UUID'),
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      await userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

export default router;
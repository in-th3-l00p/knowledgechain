import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Register validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 8 }),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
];

// Register route
router.post(
  '/register', 
  registerValidation, 
  async (req: Request, res: Response) => {
    try {
      const { email, username, password, firstName, lastName } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });

      logger.info(`New user registered: ${user.email}`);
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  });

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Create tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      config.jwt.accessToken.secret as Secret,
      {
        expiresIn: config.jwt.accessToken.expiresIn,
        algorithm: config.jwt.accessToken.algorithm,
      } as SignOptions
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      config.jwt.refreshToken.secret as Secret,
      {
        expiresIn: config.jwt.refreshToken.expiresIn
      } as SignOptions
    );

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        deviceInfo: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    logger.info(`User logged in: ${user.email}`);
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.map(ur => ur.role.name),
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Refresh token route
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!storedToken) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = jwt.sign(
      { id: storedToken.user.id, email: storedToken.user.email },
      config.jwt.accessToken.secret as Secret,
      {
        expiresIn: config.jwt.accessToken.expiresIn,
        algorithm: config.jwt.accessToken.algorithm,
      } as SignOptions
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({ message: 'Error refreshing token' });
  }
});

// Logout route
router.post('/logout', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { refreshToken } = req.body;

    // Revoke refresh token
    await prisma.refreshToken.updateMany({
      where: {
        userId: req.user!.id,
        token: refreshToken,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    // Invalidate sessions
    await prisma.session.updateMany({
      where: {
        userId: req.user!.id,
        isValid: true,
      },
      data: {
        isValid: false,
      },
    });

    logger.info(`User logged out: ${req.user!.email}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Error logging out' });
  }
});

export default router; 
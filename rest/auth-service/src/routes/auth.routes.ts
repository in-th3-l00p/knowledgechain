import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { authenticateToken } from '../middleware/auth.middleware';
import logger from '../config/logger';
import {body, validationResult} from "express-validator";
import prisma from "../config/prisma";
import {AuthRequest} from "../types/authRequest";

const router = Router();

router.post(
  '/login',
  body("email").isEmail().notEmpty(),
  body("password").isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(401).send({ errors: errors.array() });
        return;
      }
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

router.post(
  '/logout',
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const { refreshToken } = req.body;

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
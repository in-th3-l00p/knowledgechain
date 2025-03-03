import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/main';
import prisma from "../../src/utils/prisma";
import jwt from "jsonwebtoken";
import {config} from "../../src/utils/config";

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('auth routes', () => {
  const loginData = {
    email: 'test@example.com',
    password: 'Password123!',
  };

  const mockUser = {
    id: 'user1',
    email: loginData.email,
    password: 'hashedPassword',
    isActive: true,
    roles: [{ role: { name: 'USER' } }],
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const refreshToken = 'valid_refresh_token';
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
        user: mockUser,
      });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Cookie', [`refreshToken=${refreshToken}`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
    });

    it('should return 401 for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Cookie', ['refreshToken=invalid_token']);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      (prisma.user.findUnique as jest.Mock)
          .mockResolvedValueOnce(mockUser);
      const token = jwt.sign(
          { id: mockUser.id, email: mockUser.email },
          config.jwt.accessToken.secret
      );
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });
  });
}); 
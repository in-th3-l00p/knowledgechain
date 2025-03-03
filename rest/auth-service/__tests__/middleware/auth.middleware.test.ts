import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../src/middleware/auth.middleware';
import { config } from '../../src/utils/config';
import prisma from '../../src/utils/prisma';
import {checkPermission} from "../../src/utils/checkPermission";
import {AuthRequest} from "../../src/types/authRequest";

jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
}));

describe('auth middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should return 401 if no token is provided', async () => {
      await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Access token is required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', async () => {
      mockReq.headers = { authorization: 'Bearer invalid_token' };
      
      await authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should authenticate valid token and set user in request', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        isActive: true,
        roles: [{ role: { name: 'USER' } }],
      };

      const token = jwt.sign(
        { id: mockUser.id, email: mockUser.email },
        config.jwt.accessToken.secret
      );

      mockReq.headers = { authorization: `Bearer ${token}` };
      
      (prisma.user.findUnique as jest.Mock)
          .mockResolvedValueOnce(mockUser);
      await authenticateToken(
          mockReq as AuthRequest,
          mockRes as Response,
          mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        roles: ['USER'],
      });
    });
  });

  describe('checkPermission', () => {
    it('should return 401 if user is not authenticated', async () => {
      const middleware = checkPermission('READ_USER');
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access if user has required permission', async () => {
      mockReq.user = {
        id: '123',
        email: 'test@example.com',
        roles: ['USER'],
      };

      (prisma.permission.findMany as jest.Mock).mockResolvedValueOnce([
        { name: 'READ_USER' },
      ]);

      const middleware = checkPermission('READ_USER');
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access if user lacks required permission', async () => {
      mockReq.user = {
        id: '123',
        email: 'test@example.com',
        roles: ['USER'],
      };

      (prisma.permission.findMany as jest.Mock).mockResolvedValueOnce([
        { name: 'OTHER_PERMISSION' },
      ]);

      const middleware = checkPermission('READ_USER');
      await middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 
import request from 'supertest';
import app from '../../src/main';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config';
import prisma from "../../src/config/prisma";
import {Response, NextFunction} from "express";
import {AuthRequest} from "../../src/types/authRequest";

jest.mock('../../src/config/logger', () => ({
  info: jest.fn(),
}));

const loginData = {
  email: 'admin@example.com',
  password: 'Password123!',
};
const mockUser = {
  id: 'admin1',
  email: loginData.email,
  password: 'hashedPassword',
  isActive: true,
  roles: [
    { id: '1', name: 'ADMIN', description: 'Administrator' },
    { id: '2', name: 'USER', description: 'Regular User' },
  ],
};

jest.mock("../../src/middleware/auth.middleware", () => {
  return {
    authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({ message: 'Access token is required' });
        return;
      }

      req.user = {
        id: mockUser.id,
        email: mockUser.email,
        roles: mockUser.roles.map(ur => ur.name),
      };
      next();
    }
  }
});

describe('role routes', () => {
  let adminToken: string;

  beforeEach(() => {
    jest.clearAllMocks();

    adminToken = jwt.sign(
      { id: 'admin1', email: 'admin@example.com' },
      config.jwt.accessToken.secret
    );
  });

  describe('GET /api/auth/roles', () => {
    it('should return list of roles when authenticated', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.role.findMany as jest.Mock).mockResolvedValue(mockUser.roles);
      (prisma.permission.findMany as jest.Mock).mockResolvedValue([
        { name: "VIEW_ROLES" }
      ])

      const response = await request(app)
        .get('/api/auth/roles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'ADMIN');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/auth/roles');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/roles/:id', () => {
    it('should return role details when authenticated', async () => {
      const mockRole = {
        id: '1',
        name: 'ADMIN',
        description: 'Administrator',
        permissions: [
          { name: 'CREATE_USER' },
          { name: 'DELETE_USER' },
        ],
      };

      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
      (prisma.permission.findMany as jest.Mock).mockResolvedValue([
        { name: "VIEW_ROLES" }
      ])

      const response = await request(app)
        .get('/api/auth/roles/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'ADMIN');
      expect(response.body).toHaveProperty('permissions');
    });

    it('should return 404 for non-existent role', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/roles/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/auth/roles', () => {
    const newRole = {
      name: 'MODERATOR',
      description: 'Content Moderator',
      permissions: ['MODERATE_CONTENT', 'VIEW_REPORTS'],
    };

    it('should create a new role successfully', async () => {
      const mockCreatedRole = {
        id: '3',
        ...newRole,
      };

      (prisma.role.create as jest.Mock).mockResolvedValue(mockCreatedRole);

      const response = await request(app)
        .post('/api/auth/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRole);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', newRole.name);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/auth/roles/:id', () => {
    const updateData = {
      name: 'SUPER_ADMIN',
      description: 'Super Administrator',
      permissions: ['ALL'],
    };

    it('should update role successfully', async () => {
      const mockUpdatedRole = {
        id: '1',
        ...updateData,
      };

      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockUpdatedRole);
      (prisma.role.update as jest.Mock).mockResolvedValue(mockUpdatedRole);

      const response = await request(app)
        .put('/api/auth/roles/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updateData.name);
    });

    it('should return 404 for non-existent role', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/auth/roles/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/auth/roles/:id', () => {
    it('should delete role successfully', async () => {
      const mockRole = {
        id: '1',
        name: 'ADMIN',
        description: 'Administrator',
      };

      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
      (prisma.role.delete as jest.Mock).mockResolvedValue(mockRole);

      const response = await request(app)
        .delete('/api/auth/roles/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Role deleted successfully');
    });

    it('should return 404 for non-existent role', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/auth/roles/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
}); 
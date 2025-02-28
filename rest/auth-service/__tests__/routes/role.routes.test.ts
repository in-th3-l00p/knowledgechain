import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/main';
import jwt from 'jsonwebtoken';
import { config } from '../../src/config';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    role: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    permission: {
      findMany: jest.fn(),
    },
  })),
}));

describe('Role Routes', () => {
  let prisma: jest.Mocked<PrismaClient>;
  let adminToken: string;

  beforeEach(() => {
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    jest.clearAllMocks();

    // Create a valid admin token for testing
    adminToken = jwt.sign(
      { id: 'admin1', email: 'admin@example.com' },
      config.jwt.accessToken.secret
    );
  });

  describe('GET /api/roles', () => {
    it('should return list of roles when authenticated', async () => {
      const mockRoles = [
        { id: '1', name: 'ADMIN', description: 'Administrator' },
        { id: '2', name: 'USER', description: 'Regular User' },
      ];

      (prisma.role.findMany as jest.Mock).mockResolvedValue(mockRoles);

      const response = await request(app)
        .get('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name', 'ADMIN');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/roles');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/roles/:id', () => {
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

      const response = await request(app)
        .get('/api/roles/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'ADMIN');
      expect(response.body).toHaveProperty('permissions');
    });

    it('should return 404 for non-existent role', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/roles/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/roles', () => {
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
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newRole);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', newRole.name);
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/roles/:id', () => {
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
        .put('/api/roles/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', updateData.name);
    });

    it('should return 404 for non-existent role', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/roles/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/roles/:id', () => {
    it('should delete role successfully', async () => {
      const mockRole = {
        id: '1',
        name: 'ADMIN',
        description: 'Administrator',
      };

      (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);
      (prisma.role.delete as jest.Mock).mockResolvedValue(mockRole);

      const response = await request(app)
        .delete('/api/roles/1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Role deleted successfully');
    });

    it('should return 404 for non-existent role', async () => {
      (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/roles/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
}); 
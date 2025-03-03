import request from 'supertest';
import app from '../../src/main';
import jwt from 'jsonwebtoken';
import { config } from '../../src/utils/config';
import prisma from "../../src/utils/prisma";

describe('User Routes', () => {
  let authToken: string;
  beforeEach(() => {
    jest.clearAllMocks();
    authToken = jwt.sign(
      { id: 'admin1', email: 'admin@example.com' },
      config.jwt.accessToken.secret
    );
  });

  describe('GET /api/auth/users', () => {
    it('should return list of users when authenticated', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', firstName: 'User', lastName: 'One' },
        { id: '2', email: 'user2@example.com', firstName: 'User', lastName: 'Two' },
      ];

      (prisma.user.findMany as jest.Mock).mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('email', 'user1@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/auth/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/auth/users/:id', () => {
    it('should return user details when authenticated', async () => {
      const mockUser = {
        id: '1',
        email: 'user1@example.com',
        firstName: 'User',
        lastName: 'One',
        roles: [{ role: { name: 'USER' } }],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/users/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'user1@example.com');
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/users/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/auth/users/:id', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'User',
      email: 'updated@example.com',
    };

    it('should update user successfully', async () => {
      const mockUpdatedUser = {
        id: '1',
        ...updateData,
        roles: [{ role: { name: 'USER' } }],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUpdatedUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const response = await request(app)
        .put('/api/auth/users/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', updateData.email);
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/auth/users/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/auth/users/:id', () => {
    it('should delete user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'user1@example.com',
        roles: [{ role: { name: 'USER' } }],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.delete as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .delete('/api/auth/users/1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });

    it('should return 404 for non-existent user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/auth/users/999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
}); 
process.env.PORT = "8000"; // testing port

import request from 'supertest';
import app from '../src/main';
import logger from '../src/config/logger';

jest.mock('../src/config/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('express app', () => {
  describe('middleware Setup', () => {
    it('should log incoming requests', async () => {
      await request(app).get('/api/nonexistent');
      expect(logger.info).toHaveBeenCalledWith('GET /api/nonexistent');
    });

    it('should handle JSON parsing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ invalidJson: true });
      
      expect(response.status).not.toBe(500);
    });

    it('should handle errors gracefully', async () => {
      // Trigger an error by sending invalid JSON
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });
  });

  describe('route setup', () => {
    it('should have auth routes mounted', async () => {
      const response = await request(app).post('/api/auth/login').send();
      expect(response.status).not.toBe(404);
    });

    it('should have user routes mounted', async () => {
      const response = await request(app).get('/api/auth/users/profile');
      expect(response.status).not.toBe(404);
    });

    it('should have role routes mounted', async () => {
      const response = await request(app).get('/api/auth/roles');
      expect(response.status).not.toBe(404);
    });
  });
}); 
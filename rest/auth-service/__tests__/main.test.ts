process.env.PORT = "8000"; // testing port

import request from 'supertest';
import app from '../src/main';
import logger from '../src/utils/logger';

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Express Application', () => {
  describe('Middleware Setup', () => {
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

  describe('Route Setup', () => {
    it('should have auth routes mounted', async () => {
      const response = await request(app).post('/api/auth/login').send();
      expect(response.status).not.toBe(404);
    });

    it('should have user routes mounted', async () => {
      const response = await request(app).get('/api/users/profile');
      expect(response.status).not.toBe(404);
    });

    it('should have role routes mounted', async () => {
      const response = await request(app).get('/api/roles');
      expect(response.status).not.toBe(404);
    });
  });
}); 
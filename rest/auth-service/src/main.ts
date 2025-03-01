import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config';
import logger from './config/logger';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/auth/users', userRoutes);
app.use('/api/auth/roles', roleRoutes);

app.use((req, res) => {
  res.status(404).send({ error: 'Not Found' });
});

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Auth service running on port ${PORT}`);
});

export default app; 
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from './utils/logger';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import roleRoutes from './routes/role.routes';
import {initializeKafka} from "./utils/kafka";
import userSyncService from './services/UserSyncService';

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

const port = process.env.PORT || 3000;

const startApplication = async () => {
  try {
    await initializeKafka();
    await userSyncService.initialize();

    app.listen(port, () => {
      logger.info(`Auth service is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
};

startApplication().then(() => {});

export default app;
import express from 'express';
import logger from './utils/logger';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Auth service is running on port ${port}`);
});

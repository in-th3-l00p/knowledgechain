import express from 'express';
import logger from './utils/logger';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.use((req, res) => {
    res.status(404).send({ error: 'Not Found' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`User service is running on port ${port}`);
});

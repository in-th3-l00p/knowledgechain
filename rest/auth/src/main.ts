import express from 'express';
import logger from './utils/logger';

const app = express();

const port = process.env.PORT || 3000;
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});

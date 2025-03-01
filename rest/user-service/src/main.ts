import express from 'express';
import logger from './utils/logger';
import dotenv from 'dotenv';
import userRoutes from './routes/users';
import { initializeKafka } from './utils/kafka';
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

app.use('/api/users', userRoutes);

app.use((req, res) => {
    res.status(404).send({ error: 'Not Found' });
});

const port = process.env.PORT || 3000;

const startApplication = async () => {
    try {
        await initializeKafka();
        
        app.listen(port, () => {
            logger.info(`User service is running on port ${port}`);
        });
    } catch (error) {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }
};

startApplication().then(() => {});

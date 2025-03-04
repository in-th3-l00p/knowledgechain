import express from 'express';
import logger from './utils/logger';
import { initializeKafka } from './utils/kafka';
import cors from "cors";
import articleRoutes from "./routes/article.routes";
import videoRoutes from "./routes/video.routes";
import captionRoutes from "./routes/caption.routes";
import tagRoutes from "./routes/tag.routes";
import commentRoutes from "./routes/comment.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

app.use("/api/articles", articleRoutes);
app.use("/api/articles/videos", videoRoutes);
app.use("/api/articles/captions", captionRoutes);
app.use("/api/articles/tags", tagRoutes);
app.use("/api/articles/comments", commentRoutes);

app.use((req, res) => {
    res.status(404).send({ error: 'Not Found' });
});

const port = process.env.PORT || 3000;

const startApplication = async () => {
    try {
        await initializeKafka();
        
        app.listen(port, () => {
            logger.info(`Article service is running on port ${port}`);
        });
    } catch (error) {
        logger.error('Failed to start application:', error);
        process.exit(1);
    }
};

startApplication().then(() => {});

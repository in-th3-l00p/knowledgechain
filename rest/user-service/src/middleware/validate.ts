import express from "express";
import logger from "../utils/logger";
import { validationResult } from "express-validator";

export const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.info(`Validation error: ${JSON.stringify(errors.array())}`);
        res.status(400).json({errors: errors.array()});
        return;
    }
    next();
};
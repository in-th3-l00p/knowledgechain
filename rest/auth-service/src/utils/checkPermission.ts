import {NextFunction, Response} from "express";
import prisma from "./prisma";
import logger from "./logger";

import {AuthRequest} from "../types/authRequest";

export const checkPermission = (requiredPermission: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            if (!req.user) {
                res.status(401).json({message: 'User not authenticated'});
                return;
            }

            const userPermissions = await prisma.permission.findMany({
                where: {
                    roles: {
                        some: {
                            role: {
                                users: {
                                    some: {
                                        userId: req.user.id,
                                    },
                                },
                            },
                        },
                    },
                },
            });

            if (userPermissions.some(p => p.name === requiredPermission)) {
                next();
            } else {
                res.status(403).json({message: 'Insufficient permissions'});
            }
        } catch (error) {
            logger.error('Permission check error:', error);
            res.status(500).json({message: 'Error checking permissions'});
        }
    };
};
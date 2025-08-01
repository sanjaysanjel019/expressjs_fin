import { NextFunction, Request, Response } from "express";

type AsyncControllerType = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

// Change the return type here
export const asyncHandler = (controller: AsyncControllerType) => 
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await controller(req, res, next);
        } catch (error) {
            next(error);
        }
    };
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/response";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  return sendResponse(res, statusCode, false, message, undefined, [
    { error: err.stack || err.toString() }
  ]);
};

export const notFoundHandler = (req: Request, res: Response) => {
  return sendResponse(res, 404, false, `Route ${req.originalUrl} not found`);
};

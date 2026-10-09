import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  errors?: any[]
) => {
  const payload: ApiResponse<T> = {
    success,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(errors !== undefined ? { errors } : {})
  };
  return res.status(statusCode).json(payload);
};

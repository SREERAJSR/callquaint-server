import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

const errorHandling = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    console.log(err)
    err.statusCode = err.statusCode ?? 500
  res.status(err.statusCode).json({
    errorMessage: err.message,
    success: false,
  });
};

export default errorHandling
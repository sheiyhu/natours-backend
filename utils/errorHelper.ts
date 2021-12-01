// import AppError from './utils/appError';
import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  public status: string;
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational?: boolean
  ) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.message = message;
    this.isOperational = true;
  }
}

export abstract class ErrorHelper {
  public static handleMissingRoute(
    req: Request,
    _res: Response,
    next: NextFunction
  ) {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
  }

  public static globalErrorHandler(
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
  ) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
      sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
      let error = { ...err };
      error.message = err.message;

      if (error.name === 'CastError') error = handleCastErrorDB(error);
      if (error.code === 11000) error = handleDuplicateFieldsDB(error);
      if (error.name === 'ValidationError')
        error = handleValidationErrorDB(error);
      if (error.name === 'JsonWebTokenError') error = handleJWTError();
      if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

      sendErrorProd(error, req, res);
    }
  }
}

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  // Operational, trusted error: send message to client
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // Programming or other unknown error: don't leak error details
    } else {
      // 1) Log error
      console.error('ERROR 💥', err);

      // 2) Send generic message
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });

    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later',
    });
  }
};

import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { ValidationHelper } from '../../utils/validationHelper';

export abstract class TourValidation {
  public static async validateCreateTour(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const bodySchema = Joi.object().keys({
      name: Joi.string().trim().min(10).max(40).required(),
      duration: Joi.number().required(),
      maxGroupSize: Joi.number().required(),
      difficulty: Joi.string().valid('easy', 'medium', 'difficult').required(),
      ratingsAverage: Joi.number().optional(),
      ratingsQuantity: Joi.number().optional(),
      price: Joi.number().required(),
      priceDiscount: Joi.number().optional(),
      summary: Joi.string().trim().required(),
      description: Joi.string().trim().optional(),
      imageCover: Joi.string().required(),
      images: Joi.array().items(Joi.string()).optional(),
      startDates: Joi.array().items(Joi.date()).optional(),
      secretTour: Joi.boolean().optional(),
    });

    await ValidationHelper.validate(req.body, bodySchema).catch((e) => next(e));
    return next();
  }

  public static async validateUpdateTour(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const bodySchema = Joi.object().keys({
      name: Joi.string().trim().min(10).max(40).optional(),
      duration: Joi.number().optional(),
      maxGroupSize: Joi.number().optional(),
      difficulty: Joi.string().valid('easy', 'medium', 'difficult').optional(),
      ratingsAverage: Joi.number().optional(),
      ratingsQuantity: Joi.number().optional(),
      price: Joi.number().optional(),
      priceDiscount: Joi.number().optional(),
      summary: Joi.string().trim().optional(),
      description: Joi.string().trim().optional(),
      imageCover: Joi.string().optional(),
      images: Joi.array().items(Joi.string()).optional(),
      startDates: Joi.array().items(Joi.date()).optional(),
      secretTour: Joi.boolean().optional(),
    });

    await ValidationHelper.validate(req.body, bodySchema).catch((e) => next(e));
    return next();
  }

  public static async validateMongoDBid(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const paramsSchema = Joi.object().keys({
      id: Joi.string()
        .pattern(/^[a-fA-F0-9]{24}$/)
        .required(),
    });

    await ValidationHelper.validate(req.params, paramsSchema).catch((e) =>
      next(e)
    );
    return next();
  }

  public static async validateYear(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const paramsSchema = Joi.object().keys({
      year: Joi.number().required(),
    });

    await ValidationHelper.validate(req.params, paramsSchema).catch((e) =>
      next(e)
    );
    return next();
  }
}

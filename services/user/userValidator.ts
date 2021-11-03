import Joi from 'joi';
import { NextFunction, Request, Response } from 'express';
import { ValidationHelper } from '../../utils/validationHelper';

export abstract class userValidation {
  /**
   * Validate Create User
   */
  public static async validateCreateUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const bodySchema = Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
    });

    await ValidationHelper.validate(req.body, bodySchema).catch((e) => next(e));
    return next();
  }

  /**
   * Validate Login User
   */
  public static async validateLoginUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const bodySchema = Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().min(8).required(),
    });

    await ValidationHelper.validate(req.body, bodySchema).catch((e) => next(e));
    return next();
  }
}

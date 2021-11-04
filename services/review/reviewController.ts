import { Request, Response, NextFunction } from 'express';
import { FactoryHelper } from '../../utils/factoryHelper';

import { Review } from './../../models/reviewModel';

export abstract class ReviewController {
  public static setTourUserIds = (
    req: any,
    res: Response,
    next: NextFunction
  ) => {
    // Allow nested routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user._id;
    next();
  };

  public static getAllReviews = FactoryHelper.getAll(Review);
  public static getReview = FactoryHelper.getOne(Review);
  public static createReview = FactoryHelper.createOne(Review);
  public static updateReview = FactoryHelper.updateOne(Review);
  public static deleteReview = FactoryHelper.deleteOne(Review);
}

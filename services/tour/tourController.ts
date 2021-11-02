import { Request, Response, NextFunction } from 'express';
import { filterHelper } from '../../utils/filterHelper';
import { Tour } from '../../models/tourModel';

export abstract class tourController {
  public static aliasTopTours = (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  };

  public static getAllTours = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tours = await filterHelper.buildQuery(Tour.find(), req.query);

      res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
          tours,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  };

  public static getTour = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tour = await Tour.findById(req.params.id);

      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  };

  public static createTour = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const newTour = await Tour.create(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  };

  public static updateTour = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        status: 'success',
        data: {
          tour,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  };

  public static deleteTour = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await Tour.findByIdAndDelete(req.params.id);

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  };

  public static getTourStats = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const stats = await Tour.aggregate([
        {
          $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
          $group: {
            _id: { $toUpper: '$difficulty' },
            numTours: { $sum: 1 },
            numRatings: { $sum: '$ratingsQuantity' },
            avgRating: { $avg: '$ratingsAverage' },
            avgPrice: { $avg: '$price' },
            minPrice: { $min: '$price' },
            maxPrice: { $max: '$price' },
          },
        },
        {
          $sort: { avgPrice: 1 },
        },
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          stats,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  };

  public static getMonthlyPlan = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const year = (req.params.year as unknown as number) * 1;

      const plan = await Tour.aggregate([
        {
          $unwind: '$startDates',
        },
        {
          $match: {
            startDates: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`),
            },
          },
        },
        {
          $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' },
          },
        },
        {
          $addFields: { month: '$_id' },
        },
        {
          $project: {
            _id: 0,
          },
        },
        {
          $sort: { numTourStarts: -1 },
        },
        {
          $limit: 12,
        },
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          plan,
        },
      });
    } catch (err) {
      res.status(404).json({
        status: 'fail',
        message: err,
      });
    }
  };
}
